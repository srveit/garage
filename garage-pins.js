'use strict';
module.exports = {
  outputPins: {
    doorButton: {
      pin: 3,
      activeLow: true
    },
    lockSwitch: {
      pin: 5,
      activeLow: true
    },
    lightButton: {
      pin: 13,
      activeLow: true
    },
    lightRelay: {
      pin: 16,
      activeLow: true
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
      pin: 10,
      pullUp: true,
      stateLabels: ['closed', 'open']
    },
    closeLimit: {
      pin: 37,
      pullUp: true,
      activeLow: true,
      stateLabels: ['closed', 'open']
    },
    doorButton: {
      pin: 35,
      pullUp: true
    },
    lightButton: {
      pin: 22,
      pullUp: true
    },
    lockSwitch: {
      pin: 29,
      pullUp: true,
      stateLabels: ['unlocked', 'locked']
    }
  }
};
