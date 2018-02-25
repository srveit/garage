'use strict';
const util = require('util'),
  { Epoll } = require('epoll'),
  childProcess = require('child_process'),
  moment = require('moment'),
  execFile = util.promisify(childProcess.execFile),
  onoff = require('onoff'),
  _ = require('lodash'),
  q = require('q'),
  Gpio = onoff.Gpio,
  outputs = {};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getOutput(name, outputPins) {
  if (!outputPins[name]) {
    return undefined;
  }
  if (!outputs[name]) {
    outputs[name] = new Gpio(outputPins[name].pin, outputPins[name].level);
  }
  return outputs[name];
}

function pressButton(button, duration, outputPins) {
  const gpio = getOutput(button, outputPins);
  if (!gpio) {
    return Promise.reject({error: 'output ' + button + ' not found'});
  }
  duration = duration || 1000;
  gpio.writeSync(0);
  return sleep(duration)
    .then(() => {
      gpio.writeSync(1);
    });
}

function setOutput(name, state, outputPins) {
  const gpio = getOutput(name, outputPins);
  if (!gpio) {
    return Promise.reject({error: 'output ' + name + ' not found'});
  }
  if (state === 'on') {
    gpio.writeSync(0);
    return Promise.resolve('on');
  } else {
    gpio.writeSync(1);
    return Promise.resolve('off');
  }
  return Promise.reject({error: 'state ' + state + ' is not a valid state'});
}

function logState(state, oldState) {
  let prefix = '\x1b[K\x1b[1A';
  prefix = moment().format('M/D H:mm:ss A');
  console.log(prefix, 'light', state.lightButton, 'lock', state.lockSwitch,
                'door', state.doorButton, 'down', state.motorDown,
	        'up', state.motorUp, 'on', state.light,
	        'open', state.openLimit, 'closed', state.closeLimit);
}

function readAverage(gpio, debounceTimeout) {
  return Promise.all(
    _.times(debounceTimeout, i => q.delay(i * 10 + 1).then(() => gpio.readSync()))
  )
    .then(values => {
      const value = _.mean(values) > 0.5 ? 1 : 0;
      if (values[values.length - 1] !== value) {
        return readAverage(gpio, debounceTimeout);
      }
      return value;
    });
}

function processButton(err, value, name, state, gpio, handleStateChange) {
  if (err) {
    throw err;
  }

  const oldState = _.clone(state);

  if (oldState[name] !== value) {
    state[name] = value;
    handleStateChange(state, oldState);
  }
}

async function setPinUp(pin) {
  const pinMap = {
    0: 30,
    1: 31,
    2: 8,
    3: 9,
    4: 7,
    5: 21,
    6: 22,
    7: 11,
    8: 10,
    9: 13,
    10: 12,
    11: 14,
    12: 26,
    13: 23,
    14: 15,
    15: 16,
    16: 27,
    17: 0,
    18: 1,
    19: 24,
    20: 28,
    21: 29,
    22: 3,
    23: 4,
    24: 5,
    25: 6,
    26: 25,
    27: 2
  };
  let args = ['gpio', ['mode', pinMap[pin], 'up']];
  const {stdout, stderr} = await execFile(args[0], args[1]);
}

function pollerEventHandler(err, fd, events) {
  const gpio = this,
    callbacks = gpio.listeners.slice(0);

  let promise;
  if (gpio.opts.debounceTimeout > 0) {
    promise = readAverage(gpio, gpio.opts.debounceTimeout)
      .then(value => {
        if (gpio.listeners.length > 0 && gpio.opts.debounceTimeout > 0) {
          gpio.poller.modify(gpio.valueFd, Epoll.EPOLLPRI | Epoll.EPOLLONESHOT);
        }
        return value;
      });
  } else {
    promise = Promise.resolve(gpio.readSync());
  }

  promise.then(value => {
    callbacks.forEach(function (callback) {
      callback(err, value);
    });
  });
}

async function watchInputs(inputPins, handleStateChange) {
  const inputs = _.reduce(inputPins, (inputs, inputPin, name) => {
    inputs[name] = new Gpio(inputPin.pin, 'in', 'both', {
      debounceTimeout: 5,
      activeLow: inputPin.activeLow
    });
    return inputs;
  }, {}),
    state = {};

  Object.keys(inputs).forEach(key => state[key] = 0);
  await Promise.all(_.map(inputs, gpio => setPinUp(gpio.gpio)));
  _.forEach(inputs, (gpio, name) => {
    gpio.poller = new Epoll(pollerEventHandler.bind(gpio));

    gpio.readPromise = q.nbind(gpio.read, gpio);
    gpio.read((err, value) =>
              processButton(err, value, name, state, gpio, handleStateChange));
    gpio.watch((err, value) =>
               processButton(err, value, name, state, gpio, handleStateChange));
  });
}

module.exports = {
  watchInputs: watchInputs,
  pressButton: pressButton,
  setOutput: setOutput
};
