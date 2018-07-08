'use strict';

const {openInputs, monitorInputs} = require('./gpio'),
  moment = require('moment'),
  {inputs} = require('./alarm-pins'),
  report = (state, inputName) => console.log(moment().format('M/D/YY H:mm:ss A'), inputName, state);

openInputs(inputs);
monitorInputs(inputs, report);
