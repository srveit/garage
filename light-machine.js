'use strict';
const express = require('express'),
  http = require('http'),
  _ = require('lodash'),
  moment = require('moment'),
  os = require('os'),
  readline = require('readline'),
  sleep = require('sleep-promise'),
  url = require('url'),
  WebSocket = require('ws'),
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

const isWebSocketAlive = webSocket => {
  if (!webSocket) {
    return false;
  }
  if (webSocket.isAlive === false) {
    webSocket.terminate();
    return false;
  }
  webSocket.isAlive = false;
  try {
    webSocket.ping();
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') {
      console.warn('ping error', error);
    }
  }
  return true;
};

const newWebSocket = serverUrl => {
  const webSocket = new WebSocket(serverUrl);

  webSocket.on('open', () => {
    console.info(`connected to ${serverUrl}`);
    webSocket.isAlive = true;
    webSocket.send('something from ' + os.hostname());
  });

  webSocket.on('message', data => {
    webSocket.isAlive = true;
    console.info('message', data.toString());
  });

  webSocket.on('pong', data => {
    webSocket.isAlive = true;
  });

  webSocket.on('ping', data => {
    webSocket.isAlive = true;
  });

  webSocket.on('error', error => {
    console.warn('error', error);
  });
  return webSocket;
};

const watchWebSockets = webSockets => {
  setInterval(() => {
    webSockets.server.clients.forEach(isWebSocketAlive);
    if (webSockets.serverUrl && !isWebSocketAlive(webSockets.client)) {
      webSockets.client = newWebSocket(webSockets.serverUrl);
    }
  }, 5000);
};

const sendEvent = (client, event) => {
  if (client) {
    try {
      client.send(JSON.stringify(event, null, 2));
    } catch (error) {
      console.error('error sending event', error.toString());
    }
  }
};

const createWebSockets = (app, serverUrl) => {
  const server = http.createServer(app),
    webSockets = {
      server: new WebSocket.Server({ server }),
      serverUrl,
      client: serverUrl && newWebSocket(serverUrl)
    };

  webSockets.server.on('connection', (webSocket, req) => {
    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or
    // share sessions or req.headers.cookie (see
    // http://stackoverflow.com/a/16395220/151312)

    webSocket.isAlive = true;

    webSocket.on('message', data => {
      webSocket.isAlive = true;
      console.info('message', data.toString());
    });

    webSocket.on('pong', data => {
      webSocket.isAlive = true;
    });

    webSocket.on('ping', data => {
      webSocket.isAlive = true;
    });

    webSocket.on('error', error => {
      console.warn('error', error);
    });

    webSocket.send('something from ' + os.hostname());
  });

  server.listen(8080, () => console.info('Listening at http://localhost:%d',
                                         server.address().port));
  watchWebSockets(webSockets);

  webSockets.sendEvents = events => {
    events.map(event => sendEvent(webSockets.client, event));
  };
  return webSockets;
};

const main = (serverUrl) => {
  const lightMachine = createLightMachine(),
    webSockets = createWebSockets(app, serverUrl);
  keyboardEvents(lightMachine);
  const logState = (state, oldState) => {
    const events = Object.keys(inputPins)
            .map(input => generateEvent(input, state, oldState))
            .filter(event => event);

    events.map(event => lightMachine.handleEvent(event.name));
    webSockets.sendEvents(events);
  };
  watchInputs(inputPins, logState);
};

if (process.argv.length < 2) {
  console.error('error - missing server');
  console.error(`usage: ${process.argv[0]} ${process.argv[1]} server`);
  process.exit(1);
}

main(process.argv[2]);
