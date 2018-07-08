'use strict';

const Rpio = require('rpio'),

  // Pin numbers are the physical numbers on the GPIO connector
  openPins = inputs => {
    for (const input of Object.values(inputs)) {
      Rpio.open(input.pin, Rpio.INPUT, Rpio.PULL_UP);
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

  monitorPin = async (pin, handler) => {
    let previousValue;

    while (true) {
      const value = await readPin(pin);
      if (previousValue !== value) {
        previousValue = value;
        handler(value, pin);
      }
    }
  };
exports.openPins = openPins;
exports.monitorPin = monitorPin;
