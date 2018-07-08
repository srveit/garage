'use strict';

const EventEmitter = require('events'),
  moment = require('moment'),
  {openInputs, monitorInputs} = require('./gpio'),
  {createMessaging} = require('../messaging'),
  {inputs} = require('./alarm-pins'),

  capitalizeFirstLetter = string =>
    string.charAt(0).toUpperCase() + string.slice(1),

  newInputListener = () => {
    const inputListener = new EventEmitter();

    const logState = (state, inputName) => {
      const event = {
        type: 'event',
        name: `${inputName}${capitalizeFirstLetter(state)}`,
        state,
        time: moment()
      };
      inputListener.emit('event', event);
    };
    monitorInputs(inputs, logState);
    return inputListener;
  },

  main = async (to) => {
    const port = 8125,
      serverUrl = `ws://${to}:${port}/`,
      messaging = createMessaging(),
      inputListener = newInputListener();

    openInputs(inputs);
    messaging.addClient(serverUrl);
    inputListener.on('event', event => {
      messaging.sendMessage({to, message: event});
    });
  };

if (process.argv.length <= 2) {
  console.error('error - missing server');
  console.error(`usage: ${process.argv[0]} ${process.argv[1]} server`);
  process.exit(1);
}

main(process.argv[2]);
