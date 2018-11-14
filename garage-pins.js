'use strict';
module.exports = {
  outputs: {
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
  inputs: {
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
      stateLabels: ['open', 'closed']
    },
    closeLimit: {
      pin: 37,
      pullUp: true,
      activeLow: true,
      stateLabels: ['open', 'closed']
    },
    buttons: {
      pinSet: [
        {
          // bit 0
          // lightButton 120k
          pin: 35,
          pullUp: true
        },
        {
          // bit 1
          // lockSwitch 18k
          pin: 29,
          pullUp: true
        },
        {
          // bit 2
          // doorButton 3.9k
          pin: 22,
          pullUp: true
        }
      ],
      transitions: {
        0: {
          1: ['lightButton', 'on'],
          3: ['lockSwitch', 'locked'],
          7: ['doorButton', 'on'],
        },
        1: {
          0: ['lightButton', 'off'],
          3: ['lockSwitch', 'locked'],
          7: ['doorButton', 'on']
        },
        3: {
          0: ['lockSwitch', 'unlocked'],
          1: ['lightButton', 'on'],
          7: ['doorButton', 'on']
        },
        7: {
          0: ['doorButton', 'off'],
          1: ['lightButton', 'on'],
          3: ['lockSwitch', 'locked']
        }
      },
      stateLabels: ['0', 'lightButton on', '2', 'lockSwitch locked', '4', '5', '6', 'doorButton on']
    }
    // doorButton: {
    //   pin: 35,
    //   pullUp: true
    // },
    // lightButton: {
    //   pin: 22,
    //   pullUp: true
    // },
    // lockSwitch: {
    //   pin: 29,
    //   pullUp: true,
    //   stateLabels: ['unlocked', 'locked']
    // }
  }
};
