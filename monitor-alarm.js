'use strict';

const {openInputs, monitorInputs} = require('./gpio'),
  {inputs} = require('./alarm-pins'),
  report = (state, inputName) => console.log(new Date().format('M/D/YY H:mm:ss A'), inputName, state);

openInputs(inputs);
monitorInputs(inputs, report);
