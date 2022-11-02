'use strict'

const EventEmitter = require('events')
const { openInputs, monitorInputs } = require('../lib/gpio')
const { createMessaging } = require('messaging')
const { inputs } = require('../lib/alarm-pins')
const newInputListener = () => {
  const inputListener = new EventEmitter()

  const logState = (state, inputName) => {
    const event = {
      type: 'event',
      name: `${inputName} ${state}`,
      state,
      time: new Date(),
    }
    inputListener.emit('event', event)
  }
  monitorInputs(inputs, logState)
  return inputListener
}
const main = async (to) => {
  const port = 8125
  const serverUrl = `ws://${to}:${port}/`
  const messaging = createMessaging()
  const inputListener = newInputListener()

  openInputs(inputs)
  messaging.addClient(serverUrl)
  inputListener.on('event', (event) => {
    messaging.sendMessage({ to, message: event })
  })
}

if (process.argv.length <= 2) {
  console.error('error - missing server')
  console.error(`usage: ${process.argv[0]} ${process.argv[1]} server`)
  process.exit(1)
}

main(process.argv[2])
