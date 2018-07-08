'use strict';
const {openOuputs, pressButton} = require('./gpio-output'),
  {outputs} = require('./garage-pins'),

  main = async () => {
    const duration = 5000;
    openOuputs(outputs);
    await pressButton('orangeLed', duration, outputs);
    await pressButton('redLed', duration, outputs);
    await pressButton('lightButton', duration, outputs);
    await pressButton('lockSwitch', duration, outputs);
    await pressButton('doorButton', duration, outputs);
    await pressButton('lightRelay', duration, outputs);
}

main();
