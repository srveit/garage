'use strict';

const Rpio = require('rpio'),

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Pin numbers are the physical numbers on the GPIO connector
  openOuputs = outputs => {
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

exports.openOuputs = openOuputs;
exports.setOutput = setOutput;
exports.pressButton = pressButton;
