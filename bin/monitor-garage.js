'use strict'

const { openInputs, monitorInputs } = require('../lib/gpio')
const { inputs } = require('../lib/garage-pins')
const report = (state, inputName) =>
  console.log(new Date().format('M/D/YY H:mm:ss A'), inputName, state)

openInputs(inputs)
monitorInputs(inputs, report)
