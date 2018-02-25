'use strict';
const garage = require('./garage'),
  moment = require('moment'),
  {inputPins} = require('./alarm-pins');


function logState(state, oldState) {
  let prefix = '\x1b[K\x1b[1A';
  prefix = moment().format('M/D H:mm:ss A');
  console.log(prefix, 'garage door', state.garageDoor);
}

function main() {
  garage.watchInputs(inputPins, logState);
}

main();
