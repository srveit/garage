'use strict';

const gpioInput = require('./gpio-input'),
  moment = require('moment'),
  {inputPins} = require('./garage-pins');

gpioInput.openPins(inputPins);
gpioInput.monitorPin(22, (value, pin) => console.log(moment().toISOString(), pin, value));
gpioInput.monitorPin(21, (value, pin) => console.log(moment().toISOString(), pin, value));
gpioInput.monitorPin(29, (value, pin) => console.log(moment().toISOString(), pin, value));
