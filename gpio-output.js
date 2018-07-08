'use strict';

const Rpio = require('rpio'),

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Pin numbers are the physical numbers on the GPIO connector
  openPins = outputs => {
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
    console.log(pin, level);
    Rpio.write(pin, level);
  },

  pressButton = async (name, duration, outputs) => {
    setOutput(name, 'on', outputs);
    await sleep(duration || 1000);
    setOutput(name, 'off', outputs);
  };

exports.openPins = openPins;
exports.setOutput = setOutput;
exports.pressButton = pressButton;
