'use strict';

const gpioInput = require('./gpio-input'),
  moment = require('moment'),
  {inputPins} = require('./alarm-pins'),
  report = (value, pin) => console.log(moment().format('M/D/YY H:mm:ss A'), pin, value);

gpioInput.openPins(inputPins);
gpioInput.monitorInputs(inputPins, report);
