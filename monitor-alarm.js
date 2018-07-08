'use strict';
const gpioInput = require('./gpio-input'),
  moment = require('moment'),
  {inputPins} = require('./alarm-pins'),

 logState = (state, pin) => {
   let prefix = '\x1b[K\x1b[1A';
   prefix = moment().format('M/D H:mm:ss A');
   console.log(prefix, 'garage door', state.garageDoor);
 },

 main = () => {
  gpioInput.openPins(inputPins);
  gpioInput.monitorPin(37, (value, pin) => console.log(moment().toISOString(), pin, value));
}

main();
