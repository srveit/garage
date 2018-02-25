'use strict';
const express = require('express'),
  http = require('http'),
  _ = require('lodash'),
  moment = require('moment'),
  os = require('os'),
  readline = require('readline'),
  sleep = require('sleep-promise'),
  url = require('url'),
  { Server } = require('ws'),
  { pressButton, setOutput, watchInputs } = require('./garage'),
  { inputPins, outputPins } = require('./garage-pins'),
  app = express();

const machineDefinition = {
  states: [
    {
      name: 'light off',
      events: {
        'light on': {
          nextState: 'light on'
        },
        'turn light on': {
          nextState: 'light on',
          action: ['setRelay', 'on']
        }
      }
    },
    {
      name: 'light on',
      events: {
        'light off': {
          nextState: 'light off'
        },
        'turn light off': {
          nextState: 'wait for light off',
          actions: [
            ['setRelay', 'off'],
            ['setTimer', 200]
          ]
        },
        'lightButton on': {
          nextState: 'wait for light off',
          actions: [
            ['setRelay', 'off'],
            ['setTimer', 200]
          ]
        }
      }
    },
    {
      name: 'wait for light off',
      events: {
        'light off': {
          nextState: 'light off'
        },
        'turn light on': {
          nextState: 'light on',
          action: ['setRelay', 'on']
        },
        'timer expired': {
          actions: [
            'pressLightButton',
            ['setTimer', 1000]
          ]
        }
      }
    }
  ]
};

const createMachine = definition => {
  definition = Object.assign({}, definition);
  let currentState = definition.states[0];
  console.info(moment().toISOString(), 'new state', currentState.name);
  const methods = {};

  const addMethod = (name, method) => methods[name] = method;

  const handleEvent = event => {
    console.info(moment().toISOString(), 'event', event);
    const eventHandler = currentState.events[event];
    if (!eventHandler) {
//      console.warn('no event handler for', event);
      return;
    }
    if (eventHandler.nextState) {
      currentState =
        definition.states.find(state => state.name === eventHandler.nextState);
      console.info(moment().toISOString(), 'new state', currentState && currentState.name);
    }
    let actions = eventHandler.actions ||
          (eventHandler.action ? [eventHandler.action] : []);
    actions.forEach(action => {
      let method, args;
      if (_.isString(action)) {
        method = action;
        args = [];
      } else {
        method = action[0];
        args = action.slice(1);
      }
      if (methods[method]) {
        console.info(moment().toISOString(), 'action', method, args);
        methods[method].apply(null, args);
      } else {
        console.log('no method for', method);
      }
    });
  };

  addMethod(
    'setTimer',
    duration => {
      return sleep(duration)
        .then(() => handleEvent('timer expired'));
    }
  );

  return Object.freeze({
    addMethod,
    handleEvent
  });
};

const createLightMachine = () => {
  const { addMethod, handleEvent } = createMachine(machineDefinition);

  addMethod(
    'setRelay',
    state => setOutput('lightRelay', state, outputPins)
      .then(newState => console.info('lightRelay', newState))
  );
  addMethod(
    'pressLightButton',
    () => pressButton('lightButton', 500, outputPins)
  );
  return Object.freeze({
    handleEvent
  });
};

const generateEvent = (name, state, oldState) => {
  if (state[name] !== oldState[name]) {
    return {
      source: os.hostname(),
      type: 'event',
      name: `${name} ${state[name] === 1 ? 'on' : 'off'}`,
      time: moment()
    };
  }
  return undefined;
};

const keyboardEvents = machine => {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else if (key.name === 'l') {
      machine.handleEvent('turn light off');
    } else if (key.name === 'o') {
      machine.handleEvent('turn light on');
    }
  });
  console.log('Press "O" to turn on light, "L" to turn off light.');
};

app.get('/', (req, res) => res.send('Hello World!'));

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

const createWebSocket = () => {
  const server = http.createServer(app),
    wss = new Server({ server });

  wss.on('connection', (ws, req) => {
    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or
    // share sessions or req.headers.cookie (see
    // http://stackoverflow.com/a/16395220/151312)

    ws.on('message', message => {
      console.log('received: %s', message);
    });

    ws.send('something from ' + os.hostname());
  });

  server.listen(8080, () =>
                console.info('Listening at http://localhost:%d', server.address().port));

};


const main = () => {
  const lightMachine = createLightMachine();
  createWebSocket(lightMachine);
  keyboardEvents(lightMachine);
  const logState = (state, oldState) => {
    const events = Object.keys(inputPins)
            .map(input => generateEvent(input, state, oldState))
            .filter(event => event)
            .map(event => event.name);
//    console.log(events);
    events.map(event => lightMachine.handleEvent(event));
  };
  watchInputs(inputPins, logState);
};

main();
