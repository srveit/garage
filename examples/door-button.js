'use strict'
const { openOutputs, pressButton } = require('../lib/gpio')
const { outputs } = require('../lib/garage-pins')

openOutputs(outputs)
pressButton('doorButton', 1000, outputs)
