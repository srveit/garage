#!/usr/bin/env node

'use strict'
const express = require('express')
const EventEmitter = require('events')
const { createMessaging } = require('messaging')
const { createStateMachine } = require('state-machine')
const {
  openInputs,
  openOutputs,
  pressButton,
  setOutput,
  monitorInputs,
} = require('../lib/gpio')
const { inputs, outputs } = require('../lib/garage-pins')
const app = express()
const machineDefinition = [
  {
    name: 'light off',
    events: {
      'light on': {
        nextState: 'light on',
      },
      'turn light on': {
        nextState: 'light on',
        action: ['setRelay', 'on'],
      },
    },
  },
  {
    name: 'light on',
    events: {
      'light off': {
        nextState: 'light off',
      },
      'turn light off': {
        nextState: 'wait for light off',
        actions: [
          ['setRelay', 'off'],
          ['setTimer', 400],
        ],
      },
      'lightButton on': {
        nextState: 'wait for light off',
        actions: [
          ['setRelay', 'off'],
          ['setTimer', 400],
        ],
      },
    },
  },
  {
    name: 'wait for light off',
    events: {
      'light off': {
        nextState: 'light off',
      },
      'turn light on': {
        nextState: 'light on',
        action: ['setRelay', 'on'],
      },
      'timer expired': {
        actions: ['pressLightButton', ['setTimer', 1000]],
      },
    },
  },
]
const createLightMachine = () => {
  const { addMethod, handleEvent } = createStateMachine({
    states: machineDefinition,
    name: 'light',
    logger: console,
  })

  addMethod('setRelay', async (state) => {
    const newState = await setOutput('lightRelay', state, outputs)
    console.info('lightRelay', newState)
  })
  addMethod('pressLightButton', () =>
    pressButton('lightButton', 500, outputs)
  )
  return Object.freeze({
    handleEvent,
  })
}
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
// const newKeyboardListener = () => {
//   const keyboardListener = new EventEmitter()
//   readline.emitKeypressEvents(process.stdin)
//   process.stdin.setRawMode(true)
//   process.stdin.on('keypress', (str, key) => {
//     if (key.ctrl && key.name === 'c') {
//       keyboardListener.emit('exit')
//     } else if (key.name === 'l') {
//       keyboardListener.emit('event', {
//         source: os.hostname(),
//         type: 'event',
//         name: 'turn light off',
//         time: new Date(),
//       })
//     } else if (key.name === 'o') {
//       keyboardListener.emit('event', {
//         source: os.hostname(),
//         type: 'event',
//         name: 'turn light on',
//         time: new Date(),
//       })
//     }
//   })
//   console.log('Press "O" to turn on light, "L" to turn off light.')
//   return keyboardListener
// }
const configureApp = (app) => {
  app.get('/', (req, res) => res.send('Hello World!'))

  app.use((req, res) => res.send({ msg: 'hello' }))
}
const main = (to) => {
  const lightMachine = createLightMachine()
  const messaging = createMessaging({ app })
  // keyboardListener = newKeyboardListener(),
  const inputListener = newInputListener()
  const port = 8125
  const serverUrl = `ws://${to}:${port}/`

  openInputs(inputs)
  openOutputs(outputs)
  configureApp(app)
  messaging.onConnection((connection) =>
    console.log('new connection', connection, connection.peerIdentity())
  )
  // keyboardListener.on('exit', () => process.exit(0));
  // keyboardListener.on('event', event => {
  //   lightMachine.handleEvent(event.name);
  //   messaging.sendMessage({to, message: event});
  // });
  inputListener.on('event', (event) => {
    lightMachine.handleEvent(event.name)
    messaging.sendMessage({ to, message: event })
  })
  messaging.onMessage((message) => {
    const event = message.message || {}

    if (event.type === 'event') {
      console.log('message', event)
      lightMachine.handleEvent(event.name)
    }
  })
  messaging.addClient(serverUrl)
}

if (process.argv.length <= 2) {
  console.error('error - missing server')
  console.error(`usage: ${process.argv[0]} ${process.argv[1]} server`)
  process.exit(1)
}

main(process.argv[2])
