'use strict';
const express = require('express'),
  EventEmitter = require('events'),
  http = require('http'),
  _ = require('lodash'),
  moment = require('moment'),
  os = require('os'),
  readline = require('readline'),
  url = require('url'),
  {createMessaging} = require('../messaging'),
  {createStateMachine} = require('../state-machine'),
  {pressButton, setOutput, watchInputs} = require('./garage'),
  {inputPins, outputPins} = require('./garage-pins'),
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

const createLightMachine = () => {
  const { addMethod, handleEvent } = createStateMachine(machineDefinition);

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

const newPinListener = () => {
  const pinListener = new EventEmitter();

  const logState = (state, oldState) => {
    const events = Object.keys(inputPins)
            .map(input => generateEvent(input, state, oldState))
            .filter(event => event);

    events.map(event => pinListener.emit('event', event));
  };
  watchInputs(inputPins, logState);
  return pinListener;
};

const newKeyboardListener = () => {
  const keyboardListener = new EventEmitter();
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      keyboardListener.emit('exit');
    } else if (key.name === 'l') {
      keyboardListener.emit('event', {
        source: os.hostname(),
        type: 'event',
        name: 'turn light off',
        time: moment()
      });
    } else if (key.name === 'o') {
      keyboardListener.emit('event', {
        source: os.hostname(),
        type: 'event',
        name: 'turn light on',
        time: moment()
      });
    }
  });
  console.log('Press "O" to turn on light, "L" to turn off light.');
  return keyboardListener;
};

app.get('/', (req, res) => res.send('Hello World!'));

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

const main = (serverUrl) => {
  const lightMachine = createLightMachine(),
    messaging = createMessaging({app}),
    keyboardListener = newKeyboardListener(),
    pinListener = newPinListener(),
    to = 'raven';

  keyboardListener.on('exit', () => process.exit(0));
  keyboardListener.on('event', event => {
    lightMachine.handleEvent(event.name);
    messaging.send({to, message: event});
  });
  pinListener.on('event', event => {
    lightMachine.handleEvent(event.name);
    messaging.send({to, message: event});
  });
  messaging.addClient(serverUrl);
};

if (process.argv.length < 2) {
  console.error('error - missing server');
  console.error(`usage: ${process.argv[0]} ${process.argv[1]} server`);
  process.exit(1);
}

main(process.argv[2]);
