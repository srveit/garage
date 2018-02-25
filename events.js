'use strict';
const garage = require('./garage'),
  moment = require('moment'),
  INPUTS = [
    'lightButton',
    'lockSwitch',
    'doorButton',
    'motorDown',
    'motorUp',
    'light',
    'openLimit',
    'closeLimit'
  ];

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

function logState(state, oldState) {
  const events = INPUTS
          .map(input => generateEvent(input, state, oldState))
          .filter(event => event);
  console.log(events);
}

function main() {
  garage.watchInputs(logState);
}

main();
