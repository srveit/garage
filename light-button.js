'use strict';
const {openOuputs, pressButton} = require('./gpio-output'),
  {outputs} = require('./garage-pins');

openOuputs(outputs);
pressButton('lightButton', 1000, outputs);

