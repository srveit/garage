'use strict';
const {openOuputs, pressButton} = require('./gpio'),
  {outputs} = require('./garage-pins');

openOuputs(outputs);
pressButton('doorButton', 1000, outputs);
