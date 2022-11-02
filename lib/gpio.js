'use strict'

const rpio = require('rpio')

// Pin numbers are the physical numbers on the GPIO connector
const openInputs = (inputs) => {
  for (const input of Object.values(inputs)) {
    if (input.pinSet) {
      for (const input2 of input.pinSet) {
        rpio.open(
          input2.pin,
          rpio.INPUT,
          input2.pullUp
            ? rpio.PULL_UP
            : input2.pullDown
              ? rpio.PULL_DOWN
              : rpio.PULL_OFF
        )
      }
    } else {
      rpio.open(
        input.pin,
        rpio.INPUT,
        input.pullUp
          ? rpio.PULL_UP
          : input.pullDown
            ? rpio.PULL_DOWN
            : rpio.PULL_OFF
      )
    }
  }
}

const bufferValue = (buffer) => {
  let sum = 0
  for (const b of buffer) {
    sum += b
  }
  return sum * 2 > buffer.length ? 1 : 0
}

const readPin = (pin) =>
  new Promise((resolve) => {
    let index = 0
    const length = 40
    const interval = 4
    const buffer = Buffer.alloc(length, ' ', 'ascii')
    const intervalId = setInterval(() => {
      buffer[index] = rpio.read(pin)
      index += 1
      if (index >= length) {
        clearInterval(intervalId)
        resolve(bufferValue(buffer))
      }
    }, interval)
  })

const readPinSet = (pinSet) =>
  new Promise((resolve) => {
    let index = 0
    const length = 40
    const interval = 4
    const buffers = pinSet.map(() => Buffer.alloc(length, ' ', 'ascii'))
    const intervalId = setInterval(() => {
      for (let i = 0; i < pinSet.length; i++) {
        buffers[i][index] = rpio.read(pinSet[i].pin)
      }
      index += 1
      if (index >= length) {
        clearInterval(intervalId)
        resolve(
          buffers.map(bufferValue).reduce((acc, value) => acc * 2 + value, 0)
        )
      }
    }, interval)
  })

const monitorInput = async (inputName, inputs, handler) => {
  let previousValue
  const input = inputs[inputName]
  const stateLabels = input.stateLabels || ['off', 'on']

  while (true) {
    let value
    if (input.pinSet) {
      value = await readPinSet(input.pinSet)
    } else {
      value = await readPin(input.pin)
      if (input.activeLow) {
        value = 1 - value
      }
    }
    if (previousValue !== value) {
      console.log(`${inputName} ${previousValue} => ${value}`)
      if (input.transitions) {
        const [name, label] = (input.transitions &&
          input.transitions[previousValue] &&
          input.transitions[previousValue][value]) || [
          inputName,
          stateLabels[value] || value,
        ]
        previousValue = value
        if (name) {
          handler(label, name)
        }
      } else {
        previousValue = value
        handler(stateLabels[value], inputName)
      }
    }
  }
}

const monitorInputs = async (inputs, handler) =>
  Object.keys(inputs).map((inputName) =>
    monitorInput(inputName, inputs, handler)
  )

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Pin numbers are the physical numbers on the GPIO connector
const openOutputs = (outputs) => {
  for (const output of Object.values(outputs)) {
    rpio.open(output.pin, rpio.OUTPUT, output.activeLow ? rpio.HIGH : rpio.LOW)
  }
}

const setOutput = (name, state, outputs) => {
  const output = outputs[name]
  const activeLow = output.activeLow
  const pin = output.pin
  const level =
    (state === 'on' && !activeLow) || (state === 'off' && activeLow)
      ? rpio.HIGH
      : rpio.LOW
  rpio.write(pin, level)
}

const pressButton = async (name, duration, outputs) => {
  setOutput(name, 'on', outputs)
  await sleep(duration || 1000)
  setOutput(name, 'off', outputs)
}

exports.openInputs = openInputs
exports.monitorInputs = monitorInputs
exports.openOutputs = openOutputs
exports.setOutput = setOutput
exports.pressButton = pressButton
