'use strict';

const Rpio = require('rpio'),

  // Pin numbers are the physical numbers on the GPIO connector
  openPins = inputs => {
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

  monitorPin = async (name, inputs, handler) => {
    let previousValue;
    const input = inputs[name],
      pin = input.pin,
      activeLow = input.activeLow,
      stateLabels = input.stateLabels || ['off', 'on'];

    while (true) {
      const value = await readPin(pin);
      if (previousValue !== value) {
        previousValue = value;
        handler(
          stateLabels[activeLow ? 1 - value : value],
          name
        );
      }
    }
  },

  monitorInputs = async (inputs, handler) => {
    Object.keys(inputs).map(name => monitorPin(name, inputs, handler));

  };
exports.openPins = openPins;
exports.monitorPin = monitorPin;
exports.monitorInputs = monitorInputs;
