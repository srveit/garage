'use strict';
const {openPins, setOutput} = require('./gpio-output'),
  {outputPins} = require('./garage-pins');

if (process.argv.length < 3) {
  console.error('error - state must be specified.');
  console.error('usage:', process.argv[1], 'on|off');
  process.exit(1);
}

openPins(outputPins);
setOutput('redLed', process.argv[2], outputPins);
