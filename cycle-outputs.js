'use strict';
const {openPins, pressButton} = require('./gpio-output'),
  {outputPins} = require('./garage-pins'),

  main = async () => {
    const duration = 5000;
    openPins(outputPins);
    await pressButton('orangeLed', duration, outputPins);
    await pressButton('redLed', duration, outputPins);
    await pressButton('lightButton', duration, outputPins);
    await pressButton('lockSwitch', duration, outputPins);
    await pressButton('doorButton', duration, outputPins);
    await pressButton('lightRelay', duration, outputPins);
}

main();
