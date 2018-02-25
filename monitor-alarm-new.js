'use strict';
const garage = require('./garage'),
  moment = require('moment'),
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

const logState = (state, oldState) => {
  const events = Object.keys(inputPins)
          .map(input => generateEvent(input, state, oldState))
          .filter(event => event);
};

const main = () => {
  garage.watchInputs(inputPins, logState);
};

main();
