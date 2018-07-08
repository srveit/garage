'use strict';
const {openOuputs, setOutput} = require('./gpio'),
  {outputs} = require('./garage-pins');

if (process.argv.length < 3) {
  console.error('error - state must be specified.');
  console.error('usage:', process.argv[1], 'on|off');
  process.exit(1);
}

openOuputs(outputs);
setOutput('lockSwitch', process.argv[2], outputs);
