'use strict';
const { pressButton } = require('./garage'),
  { outputPins } = require('./garage-pins');

function main() {
  const duration = 5000;

  return pressButton('led1', duration, outputPins)
    .then(() => pressButton('led2', duration, outputPins))
    .then(() => pressButton('lightButton', duration, outputPins))
    .then(() => pressButton('lockSwitch', duration, outputPins))
    .then(() => pressButton('doorButton', duration, outputPins))
    .then(() => pressButton('lightRelay', duration, outputPins));
}

main();
