'use strict';

const Rpio = require('rpio'),

  // Pin numbers are the physical numbers on the GPIO connector
  openInputs = inputs => {
    for (const input of Object.values(inputs)) {
      Rpio.open(
        input.pin,
        Rpio.INPUT,
        input.pullUp ? Rpio.PULL_UP :
          (input.pullDown ? Rpio.PULL_DOWN : Rpio.PULL_OFF)
      );
    }
  },

  bufferValue = buffer => {
    let sum = 0;
    for (const b of buffer) {
      sum += b;
    }
    return sum * 2 > buffer.length ? 1 : 0;
  },

  readPin = pin => new Promise(resolve => {
    let index = 0;
    const length = 40,
      interval = 4,
      buffer = Buffer.alloc(length, ' ', 'ascii'),
      intervalId = setInterval(
      () => {
        buffer[index] = Rpio.read(pin);
        index += 1;
        if (index >= length) {
          clearInterval(intervalId);
          resolve(bufferValue(buffer));
        }
      },
      interval
    );
  }),

  monitorInput = async (inputName, inputs, handler) => {
    let previousValue;
    const input = inputs[inputName],
      pin = input.pin,
      activeLow = input.activeLow,
      stateLabels = input.stateLabels || ['off', 'on'];

    while (true) {
      const value = await readPin(pin);
      if (previousValue !== value) {
        previousValue = value;
        handler(
          stateLabels[activeLow ? 1 - value : value],
          inputName
        );
      }
    }
  },

  monitorInputs = async (inputs, handler) => Object.keys(inputs)
  .map(inputName => monitorInput(inputName, inputs, handler)),

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Pin numbers are the physical numbers on the GPIO connector
  openOutputs = outputs => {
    for (const output of Object.values(outputs)) {
      Rpio.open(
        output.pin,
        Rpio.OUTPUT,
        output.activeLow ? Rpio.HIGH : Rpio.LOW
      );
    }
  },

  setOutput = (name, state, outputs) => {
    const output = outputs[name],
      activeLow = output.activeLow,
      pin = output.pin,
      level = (state === 'on' && !activeLow || state === 'off' && activeLow) ?
      Rpio.HIGH : Rpio.LOW;
    Rpio.write(pin, level);
  },

  pressButton = async (name, duration, outputs) => {
    setOutput(name, 'on', outputs);
    await sleep(duration || 1000);
    setOutput(name, 'off', outputs);
  };

exports.openInputs = openInputs;
exports.monitorInputs = monitorInputs;
exports.openOutputs = openOutputs;
exports.setOutput = setOutput;
exports.pressButton = pressButton;
