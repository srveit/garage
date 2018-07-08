'use strict';
const {openPins, pressButton} = require('./gpio-output'),
  {outputPins} = require('./garage-pins');

openPins(outputPins);
pressButton('lightButton', 1000, outputPins);

