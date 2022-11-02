'use strict'
const { openOutputs, pressButton } = require('../lib/gpio')
const { outputs } = require('../lib/garage-pins')

openOutputs(outputs)
pressButton('lightButton', 1000, outputs)
