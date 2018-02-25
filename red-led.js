'use strict';
const { setOutput } = require('./garage'),
  {outputPins} = require('./garage-pins');

if (process.argv.length < 3) {
  console.error('error - state must be specified.');
  console.error('usage:', process.argv[1], 'on|off');
  process.exit(1);
}

setOutput('redLed', process.argv[2], outputPins)
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
