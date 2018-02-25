'use strict';
const garage = require('./garage'),
  moment = require('moment'),
  {inputPins} = require('./garage-pins');


function logState(state, oldState) {
  let prefix = '\x1b[K\x1b[1A';
  prefix = moment().format('M/D H:mm:ss A');
  console.log(prefix, 'light', state.lightButton, 'lock', state.lockSwitch,
                'door', state.doorButton, 'down', state.motorDown,
	        'up', state.motorUp, 'on', state.light,
	        'open', state.openLimit, 'closed', state.closeLimit);
}

function main() {
  garage.watchInputs(inputPins, logState);
}

main();
