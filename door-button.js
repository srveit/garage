'use strict';
const { pressButton } = require('./garage'),
  {outputPins} = require('./garage-pins');

pressButton('doorButton', 1000, outputPins);
