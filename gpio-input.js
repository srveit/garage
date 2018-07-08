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

  monitorPin = async (inputName, inputs, handler) => {
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
    .map(inputName => monitorPin(inputName, inputs, handler));

exports.openInputs = openInputs;
exports.monitorPin = monitorPin;
exports.monitorInputs = monitorInputs;
