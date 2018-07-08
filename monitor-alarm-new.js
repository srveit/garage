'use strict';
const EventEmitter = require('events'),
  moment = require('moment'),
  {watchInputs} = require('./garage'),
  {createMessaging} = require('../messaging'),
  {inputPins} = require('./alarm-pins');

const generateEvent = (name, state, oldState) => {
  if (state[name] !== oldState[name]) {
    return {
      name,
      state: state[name],
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
      .filter(event => event)
      .map(event => {
        return {
          type: 'event',
          name: `${event.name}${event.state ? 'Closed' : 'Opened'}`,
          time: event.time
        };
      });

    events.map(event => pinListener.emit('event', event));
  };
  watchInputs(inputPins, logState);
  return pinListener;
};

const main = async (to) => {
  const port = 8125,
    serverUrl = `ws://${to}:${port}/`,
    messaging = createMessaging(),
    pinListener = newPinListener();

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
