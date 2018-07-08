'use strict';
module.exports = {
  outputs: {},
  inputs: {
    garageDoor: {
      pin: 15,
      pullDown: true,
      stateLabels: ['open', 'closed']
    }
  }
};
