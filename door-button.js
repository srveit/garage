'use strict';
const {openOutputs, pressButton} = require('./gpio'),
  {outputs} = require('./garage-pins');

openOutputs(outputs);
pressButton('doorButton', 1000, outputs);
