'use strict';
module.exports = {
  outputPins: {
    doorButton: {
      pin: 2,
      level: 'high'
    },
    orangeLed: {
      pin: 4,
      level: 'low'
    },
    redLed: {
      pin: 17,
      level: 'low'
    },
    lightButton: {
      pin: 27,
      level: 'high'
    },
    lightRelay: {
      pin: 23,
      level: 'high'
    },
    lockSwitch: {
      pin: 3,
      level: 'high'
    }
  },
  inputPins: {
    lightButton: {
      pin: 25
    },
    lockSwitch: {
      pin: 5
    },
    doorButton: {
      pin: 19
    },
    // motorDown: {
    //   pin: 6
    // },
    light: {
      pin: 9,
      activeLow: true
    },
    // motorUp: {
    //   pin: 11
    // },
    openLimit: {
      pin: 15
    },
    closeLimit: {
      pin: 26,
      activeLow: true
    }
  }
};
