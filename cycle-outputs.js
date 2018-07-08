'use strict';
const {openOutputs, pressButton} = require('./gpio'),
  {outputs} = require('./garage-pins'),

  main = async () => {
    const duration = 5000;
    openOutputs(outputs);
    await pressButton('orangeLed', duration, outputs);
    await pressButton('redLed', duration, outputs);
    await pressButton('lightButton', duration, outputs);
    await pressButton('lockSwitch', duration, outputs);
    await pressButton('doorButton', duration, outputs);
    await pressButton('lightRelay', duration, outputs);
}

main();
