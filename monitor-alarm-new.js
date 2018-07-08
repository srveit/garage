'use strict';

const EventEmitter = require('events'),
  moment = require('moment'),
  {openInputs, monitorInputs} = require('./gpio-input'),
  {createMessaging} = require('../messaging'),
  {inputs} = require('./alarm-pins'),

  capitalizeFirstLetter = string =>
    string.charAt(0).toUpperCase() + string.slice(1),

  generateEvent = (name, state, oldState) => {
    if (state[name] !== oldState[name]) {
      return {
        name,
        state: state[name],
        time: moment()
      };
    }
    return undefined;
  },

  newPinListener = () => {
    const pinListener = new EventEmitter();

    const logState = (state, inputName) => {
      const event = {
        name: `${inputName}${capitalizeFirstLetter(state)}`,
        state,
        time: moment()
      };
      pinListener.emit('event', event);
    };
    monitorInputs(inputs, logState);
    return pinListener;
  },

  main = async (to) => {
    const port = 8125,
      serverUrl = `ws://${to}:${port}/`,
      messaging = createMessaging(),
      pinListener = newPinListener();

    openInputs(inputs);
    messaging.addClient(serverUrl);
    pinListener.on('event', event => {
      messaging.sendMessage({to, message: event});
    });
  };

if (process.argv.length <= 2) {
  console.error('error - missing server');
  console.error(`usage: ${process.argv[0]} ${process.argv[1]} server`);
  process.exit(1);
}

main(process.argv[2]);
