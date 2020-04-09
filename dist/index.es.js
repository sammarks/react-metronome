import React from 'react';
import PropTypes from 'prop-types';

/* eslint-env worker */

var worker = function worker() {
  var ACTION_START = 'START';
  var ACTION_STOP = 'STOP';
  var ACTION_UPDATE = 'UPDATE';
  var ACTION_TICK = 'TICK';

  var SCHEDULER_INTERVAL = 25;
  var timer = null;

  self.onmessage = function (event) {
    var action = event.data.action;


    switch (action) {
      case ACTION_START:
        timer = setInterval(function () {
          return self.postMessage(ACTION_TICK);
        }, SCHEDULER_INTERVAL);
        break;

      case ACTION_STOP:
        clearInterval(timer);
        timer = null;
        break;

      case ACTION_UPDATE:
        if (timer) {
          clearInterval(timer);
          timer = setInterval(function () {
            return self.postMessage(ACTION_TICK);
          }, SCHEDULER_INTERVAL);
        }
        break;

      default:
        throw new Error('Action must be of type: ' + ACTION_START + ', ' + ACTION_STOP + ' or ' + ACTION_UPDATE + ' (received ' + action + ').');
    }
  };
};

var code = worker.toString();
code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));

var blob = new Blob([code], { type: 'application/javascript' });
var workerScript = URL.createObjectURL(blob);

var ACTION_START = 'START';
var ACTION_STOP = 'STOP';
var ACTION_UPDATE = 'UPDATE';
var ACTION_TICK = 'TICK';
var TICKS_PER_BEAT_BINARY = 16;
var TICKS_PER_BEAT_TERNARY = 12;
var SECONDS_IN_MINUTE = 60;
var SCHEDULE_AHEAD_TIME = 0.1;
var NOTE_LENGTH = 0.05;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var _require = require('../package.json');
var LIB_NAME = _require.name;

var Metronome$1 = function (_React$Component) {
  inherits(Metronome, _React$Component);

  function Metronome(props) {
    classCallCheck(this, Metronome);

    var _this = possibleConstructorReturn(this, (Metronome.__proto__ || Object.getPrototypeOf(Metronome)).call(this, props));

    _this.runScheduler = function () {
      while (_this.nextNoteTime < _this.audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
        _this.tick(_this.currentBeat, _this.nextNoteTime);

        var secondsPerBeat = SECONDS_IN_MINUTE / _this.state.tempo;
        _this.nextNoteTime += _this.state.beatsPerMeasure / _this.ticksPerBeat * secondsPerBeat;
        _this.currentBeat++;

        if (_this.currentBeat === _this.ticksPerBeat) {
          _this.currentBeat = 0;
        }
      }
    };

    _this.tick = function (beat, time) {
      var isFirstBeat = beat === 0;
      var isQuarterBeat = beat % (_this.ticksPerBeat / _this.state.beatsPerMeasure) === 0;
      var isTripletBeat = _this.ticksPerBeat === TICKS_PER_BEAT_TERNARY && beat % (_this.ticksPerBeat / _this.state.beatsPerMeasure) !== 0;
      var isEighthBeat = beat % (_this.ticksPerBeat / (_this.state.beatsPerMeasure * 2)) === 0;

      var playTick = false;

      var osc = _this.audioContext.createOscillator();
      var gainNode = _this.audioContext.createGain();
      osc.connect(gainNode);
      gainNode.connect(_this.audioContext.destination);

      if (_this.state.subdivision === 4) {
        playTick = true;
        osc.frequency.setTargetAtTime(_this.props.subdivisionFrequency, _this.audioContext.currentTime, 0.001);
        gainNode.gain.setTargetAtTime(_this.props.subdivisionVolume, _this.audioContext.currentTime, 0.001);
      }

      if (_this.state.subdivision === 3 && isTripletBeat) {
        playTick = true;
        osc.frequency.setTargetAtTime(_this.props.subdivisionFrequency, _this.audioContext.currentTime, 0.001);
        gainNode.gain.setTargetAtTime(_this.props.subdivisionVolume, _this.audioContext.currentTime, 0.001);
      }

      if (_this.state.subdivision === 2 && isEighthBeat) {
        playTick = true;
        osc.frequency.setTargetAtTime(_this.props.subdivisionFrequency, _this.audioContext.currentTime, 0.001);
        gainNode.gain.setTargetAtTime(_this.props.subdivisionVolume, _this.audioContext.currentTime, 0.001);
      }

      if (isQuarterBeat) {
        playTick = true;
        osc.frequency.setTargetAtTime(_this.props.subdivisionFrequency, _this.audioContext.currentTime, 0.001);
        gainNode.gain.setTargetAtTime(_this.props.beatVolume, _this.audioContext.currentTime, 0.001);
      }

      if (isFirstBeat) {
        playTick = true;
        osc.frequency.setTargetAtTime(_this.props.beatFrequency, _this.audioContext.currentTime, 0.0001);
        gainNode.gain.setTargetAtTime(_this.props.beatVolume, _this.audioContext.currentTime, 0.001);
      }

      if (isFirstBeat || isQuarterBeat) {
        _this.setState(function (state) {
          return {
            beat: state.beat === _this.state.beatsPerMeasure ? 1 : state.beat + 1 || 1
          };
        }, function () {
          _this.props.onTick(_this.state);
        });
      }

      if (playTick) {
        osc.start(time);
        osc.stop(time + NOTE_LENGTH);

        _this.setState(function (state) {
          return {
            subBeat: state.subBeat === _this.state.subdivision ? 1 : state.subBeat + 1 || 1
          };
        }, function () {
          _this.props.onSubtick(_this.state);
        });
      }
    };

    _this.start = function () {
      _this.currentBeat = 0;
      _this.nextNoteTime = _this.audioContext.currentTime;

      _this.timerWorker.postMessage({
        action: ACTION_START,
        tempo: _this.state.tempo,
        subdivision: _this.state.subdivision
      });

      _this.setState({
        beat: 0,
        playing: true
      }, function () {
        _this.props.onStart(_this.state);
      });
    };

    _this.stop = function () {
      _this.timerWorker.postMessage({
        action: ACTION_STOP
      });

      _this.setState({
        playing: false
      }, function () {
        _this.props.onStop(_this.state);
      });
    };

    _this.onPlay = function () {
      _this.state.playing ? _this.stop() : _this.start();
    };

    _this.onTempoChange = function (tempo) {
      _this.timerWorker.postMessage({
        action: ACTION_UPDATE
      });

      _this.setState({
        tempo: tempo
      });
    };

    if (_this.props.subdivision < 1 || _this.props.subdivision > 4) {
      throw new Error(LIB_NAME + ': the `subdivision` prop must be between 1 and 4.');
    }

    _this.ticksPerBeat = _this.props.beatsPerMeasure % 3 === 0 || _this.props.subdivision % 3 === 0 ? TICKS_PER_BEAT_TERNARY : TICKS_PER_BEAT_BINARY;
    _this.timerWorker = new Worker(workerScript);
    _this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    _this.nextNoteTime = 0;
    _this.currentBeat = 0;

    _this.state = {
      beat: 0,
      subBeat: 0,
      playing: _this.props.autoplay === true,
      tempo: _this.props.tempo,
      beatsPerMeasure: _this.props.beatsPerMeasure,
      subdivision: _this.props.subdivision
    };
    return _this;
  }

  createClass(Metronome, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.timerWorker.onmessage = function (event) {
        if (event.data === ACTION_TICK) {
          _this2.runScheduler();
        }
      };

      this.state.playing && this.start();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.timerWorker.postMessage({
        action: ACTION_STOP
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.render(_extends({}, this.state, {
        onTempoChange: this.onTempoChange,
        onPlay: this.onPlay
      }));
    }
  }]);
  return Metronome;
}(React.Component);

Metronome$1.propTypes = {
  tempo: PropTypes.number,
  beatsPerMeasure: PropTypes.number,
  subdivision: PropTypes.number,
  autoplay: PropTypes.bool,
  beatFrequency: PropTypes.number,
  beatVolume: PropTypes.number,
  subdivisionFrequency: PropTypes.number,
  subdivisionVolume: PropTypes.number,
  render: PropTypes.func,
  onTick: PropTypes.func,
  onSubtick: PropTypes.func,
  onStart: PropTypes.func,
  onStop: PropTypes.func
};
Metronome$1.defaultProps = {
  tempo: 120,
  beatsPerMeasure: 4,
  subdivision: 1,
  beatFrequency: 880,
  beatVolume: 1,
  subdivisionFrequency: 440,
  subdivisionVolume: 0.5,
  autoplay: false,
  render: function render() {
    return null;
  },
  onTick: function onTick() {},
  onSubtick: function onSubtick() {},
  onStart: function onStart() {},
  onStop: function onStop() {}
};

export default Metronome$1;
//# sourceMappingURL=index.es.js.map
