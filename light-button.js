'use strict';
const { pressButton } = require('./garage'),
  {outputPins} = require('./garage-pins');

pressButton('lightButton', 1000, outputPins);
