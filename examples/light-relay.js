'use strict'
const { openOutputs, setOutput } = require('./gpio')
const { outputs } = require('./garage-pins')

if (process.argv.length < 3) {
  console.error('error - state must be specified.')
  console.error('usage:', process.argv[1], 'on|off')
  process.exit(1)
}

openOutputs(outputs)
setOutput('lightRelay', process.argv[2], outputs)
