'use strict';
const {openPins, pressButton, setOutput} = require('./gpio-output'),
  {outputPins} = require('./garage-pins');

openPins(outputPins);
// pressButton('lightButton', 1000, outputPins);
setOutput('lightButton', process.argv[2], outputPins);
