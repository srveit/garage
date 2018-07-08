'use strict';
module.exports = {
  outputPins: {
    doorButton: {
      pin: 3
    },
    lockSwitch: {
      pin: 5
    },
    lightButton: {
      pin: 13
    },
    lightRelay: {
      pin: 16
    },
    orangeLed: {
      pin: 7,
      activeLow: true
    },
    redLed: {
      pin: 11,
      activeLow: true
    }
  },
  inputPins: {
    light: {
      pin: 21,
      pullUp: true,
      activeLow: true
    },
    motorUp: {
      pin: 23,
      pullUp: true
    },
    motorDown: {
      pin: 31,
      pullUp: true
    },
    openLimit: {
      pin: 10
    },
    closeLimit: {
      pin: 37,
      activeLow: true
    },
    doorButton: {
      pin: 35
    },
    lightButton: {
      pin: 22
    },
    lockSwitch: {
      pin: 29
    }
  }
};
