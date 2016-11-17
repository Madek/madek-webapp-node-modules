'use strict';

exports.__esModule = true;

var _component = require('../component');

var _component2 = _interopRequireDefault(_component);

var _htmlTrackElement = require('../tracks/html-track-element');

var _htmlTrackElement2 = _interopRequireDefault(_htmlTrackElement);

var _htmlTrackElementList = require('../tracks/html-track-element-list');

var _htmlTrackElementList2 = _interopRequireDefault(_htmlTrackElementList);

var _mergeOptions = require('../utils/merge-options.js');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

var _textTrack = require('../tracks/text-track');

var _textTrack2 = _interopRequireDefault(_textTrack);

var _textTrackList = require('../tracks/text-track-list');

var _textTrackList2 = _interopRequireDefault(_textTrackList);

var _videoTrackList = require('../tracks/video-track-list');

var _videoTrackList2 = _interopRequireDefault(_videoTrackList);

var _audioTrackList = require('../tracks/audio-track-list');

var _audioTrackList2 = _interopRequireDefault(_audioTrackList);

var _fn = require('../utils/fn.js');

var Fn = _interopRequireWildcard(_fn);

var _log = require('../utils/log.js');

var _log2 = _interopRequireDefault(_log);

var _timeRanges = require('../utils/time-ranges.js');

var _buffer = require('../utils/buffer.js');

var _mediaError = require('../media-error.js');

var _mediaError2 = _interopRequireDefault(_mediaError);

var _window = require('global/window');

var _window2 = _interopRequireDefault(_window);

var _document = require('global/document');

var _document2 = _interopRequireDefault(_document);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file tech.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Media Technology Controller - Base class for media playback
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * technology controllers like Flash and HTML5
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

function createTrackHelper(self, kind, label, language) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var tracks = self.textTracks();

  options.kind = kind;

  if (label) {
    options.label = label;
  }
  if (language) {
    options.language = language;
  }
  options.tech = self;

  var track = new _textTrack2['default'](options);

  tracks.addTrack_(track);

  return track;
}

/**
 * Base class for media (HTML5 Video, Flash) controllers
 *
 * @param {Object=} options Options object
 * @param {Function=} ready Ready callback function
 * @extends Component
 * @class Tech
 */

var Tech = function (_Component) {
  _inherits(Tech, _Component);

  function Tech() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var ready = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

    _classCallCheck(this, Tech);

    // we don't want the tech to report user activity automatically.
    // This is done manually in addControlsListeners
    options.reportTouchActivity = false;

    // keep track of whether the current source has played at all to
    // implement a very limited played()
    var _this = _possibleConstructorReturn(this, _Component.call(this, null, options, ready));

    _this.hasStarted_ = false;
    _this.on('playing', function () {
      this.hasStarted_ = true;
    });
    _this.on('loadstart', function () {
      this.hasStarted_ = false;
    });

    _this.textTracks_ = options.textTracks;
    _this.videoTracks_ = options.videoTracks;
    _this.audioTracks_ = options.audioTracks;

    // Manually track progress in cases where the browser/flash player doesn't report it.
    if (!_this.featuresProgressEvents) {
      _this.manualProgressOn();
    }

    // Manually track timeupdates in cases where the browser/flash player doesn't report it.
    if (!_this.featuresTimeupdateEvents) {
      _this.manualTimeUpdatesOn();
    }

    if (options.nativeCaptions === false || options.nativeTextTracks === false) {
      _this.featuresNativeTextTracks = false;
    }

    if (!_this.featuresNativeTextTracks) {
      _this.on('ready', _this.emulateTextTracks);
    }

    _this.initTextTrackListeners();
    _this.initTrackListeners();

    // Turn on component tap events
    _this.emitTapEvents();
    return _this;
  }

  /* Fallbacks for unsupported event types
  ================================================================================ */
  // Manually trigger progress events based on changes to the buffered amount
  // Many flash players and older HTML5 browsers don't send progress or progress-like events
  /**
   * Turn on progress events
   *
   * @method manualProgressOn
   */


  Tech.prototype.manualProgressOn = function manualProgressOn() {
    this.on('durationchange', this.onDurationChange);

    this.manualProgress = true;

    // Trigger progress watching when a source begins loading
    this.one('ready', this.trackProgress);
  };

  /**
   * Turn off progress events
   *
   * @method manualProgressOff
   */


  Tech.prototype.manualProgressOff = function manualProgressOff() {
    this.manualProgress = false;
    this.stopTrackingProgress();

    this.off('durationchange', this.onDurationChange);
  };

  /**
   * Track progress
   *
   * @method trackProgress
   */


  Tech.prototype.trackProgress = function trackProgress() {
    this.stopTrackingProgress();
    this.progressInterval = this.setInterval(Fn.bind(this, function () {
      // Don't trigger unless buffered amount is greater than last time

      var numBufferedPercent = this.bufferedPercent();

      if (this.bufferedPercent_ !== numBufferedPercent) {
        this.trigger('progress');
      }

      this.bufferedPercent_ = numBufferedPercent;

      if (numBufferedPercent === 1) {
        this.stopTrackingProgress();
      }
    }), 500);
  };

  /**
   * Update duration
   *
   * @method onDurationChange
   */


  Tech.prototype.onDurationChange = function onDurationChange() {
    this.duration_ = this.duration();
  };

  /**
   * Create and get TimeRange object for buffering
   *
   * @return {TimeRangeObject}
   * @method buffered
   */


  Tech.prototype.buffered = function buffered() {
    return (0, _timeRanges.createTimeRange)(0, 0);
  };

  /**
   * Get buffered percent
   *
   * @return {Number}
   * @method bufferedPercent
   */


  Tech.prototype.bufferedPercent = function bufferedPercent() {
    return (0, _buffer.bufferedPercent)(this.buffered(), this.duration_);
  };

  /**
   * Stops tracking progress by clearing progress interval
   *
   * @method stopTrackingProgress
   */


  Tech.prototype.stopTrackingProgress = function stopTrackingProgress() {
    this.clearInterval(this.progressInterval);
  };

  /**
   * Set event listeners for on play and pause and tracking current time
   *
   * @method manualTimeUpdatesOn
   */


  Tech.prototype.manualTimeUpdatesOn = function manualTimeUpdatesOn() {
    this.manualTimeUpdates = true;

    this.on('play', this.trackCurrentTime);
    this.on('pause', this.stopTrackingCurrentTime);
  };

  /**
   * Remove event listeners for on play and pause and tracking current time
   *
   * @method manualTimeUpdatesOff
   */


  Tech.prototype.manualTimeUpdatesOff = function manualTimeUpdatesOff() {
    this.manualTimeUpdates = false;
    this.stopTrackingCurrentTime();
    this.off('play', this.trackCurrentTime);
    this.off('pause', this.stopTrackingCurrentTime);
  };

  /**
   * Tracks current time
   *
   * @method trackCurrentTime
   */


  Tech.prototype.trackCurrentTime = function trackCurrentTime() {
    if (this.currentTimeInterval) {
      this.stopTrackingCurrentTime();
    }
    this.currentTimeInterval = this.setInterval(function () {
      this.trigger({ type: 'timeupdate', target: this, manuallyTriggered: true });

      // 42 = 24 fps // 250 is what Webkit uses // FF uses 15
    }, 250);
  };

  /**
   * Turn off play progress tracking (when paused or dragging)
   *
   * @method stopTrackingCurrentTime
   */


  Tech.prototype.stopTrackingCurrentTime = function stopTrackingCurrentTime() {
    this.clearInterval(this.currentTimeInterval);

    // #1002 - if the video ends right before the next timeupdate would happen,
    // the progress bar won't make it all the way to the end
    this.trigger({ type: 'timeupdate', target: this, manuallyTriggered: true });
  };

  /**
   * Turn off any manual progress or timeupdate tracking
   *
   * @method dispose
   */


  Tech.prototype.dispose = function dispose() {

    // clear out all tracks because we can't reuse them between techs
    this.clearTracks(['audio', 'video', 'text']);

    // Turn off any manual progress or timeupdate tracking
    if (this.manualProgress) {
      this.manualProgressOff();
    }

    if (this.manualTimeUpdates) {
      this.manualTimeUpdatesOff();
    }

    _Component.prototype.dispose.call(this);
  };

  /**
   * clear out a track list, or multiple track lists
   *
   * Note: Techs without source handlers should call this between
   * sources for video & audio tracks, as usually you don't want
   * to use them between tracks and we have no automatic way to do
   * it for you
   *
   * @method clearTracks
   * @param {Array|String} types type(s) of track lists to empty
   */


  Tech.prototype.clearTracks = function clearTracks(types) {
    var _this2 = this;

    types = [].concat(types);
    // clear out all tracks because we can't reuse them between techs
    types.forEach(function (type) {
      var list = _this2[type + 'Tracks']() || [];
      var i = list.length;

      while (i--) {
        var track = list[i];

        if (type === 'text') {
          _this2.removeRemoteTextTrack(track);
        }
        list.removeTrack_(track);
      }
    });
  };

  /**
   * Reset the tech. Removes all sources and resets readyState.
   *
   * @method reset
   */


  Tech.prototype.reset = function reset() {};

  /**
   * When invoked without an argument, returns a MediaError object
   * representing the current error state of the player or null if
   * there is no error. When invoked with an argument, set the current
   * error state of the player.
   * @param {MediaError=} err    Optional an error object
   * @return {MediaError}        the current error object or null
   * @method error
   */


  Tech.prototype.error = function error(err) {
    if (err !== undefined) {
      this.error_ = new _mediaError2['default'](err);
      this.trigger('error');
    }
    return this.error_;
  };

  /**
   * Return the time ranges that have been played through for the
   * current source. This implementation is incomplete. It does not
   * track the played time ranges, only whether the source has played
   * at all or not.
   * @return {TimeRangeObject} a single time range if this video has
   * played or an empty set of ranges if not.
   * @method played
   */


  Tech.prototype.played = function played() {
    if (this.hasStarted_) {
      return (0, _timeRanges.createTimeRange)(0, 0);
    }
    return (0, _timeRanges.createTimeRange)();
  };

  /**
   * Set current time
   *
   * @method setCurrentTime
   */


  Tech.prototype.setCurrentTime = function setCurrentTime() {
    // improve the accuracy of manual timeupdates
    if (this.manualTimeUpdates) {
      this.trigger({ type: 'timeupdate', target: this, manuallyTriggered: true });
    }
  };

  /**
   * Initialize texttrack listeners
   *
   * @method initTextTrackListeners
   */


  Tech.prototype.initTextTrackListeners = function initTextTrackListeners() {
    var textTrackListChanges = Fn.bind(this, function () {
      this.trigger('texttrackchange');
    });

    var tracks = this.textTracks();

    if (!tracks) {
      return;
    }

    tracks.addEventListener('removetrack', textTrackListChanges);
    tracks.addEventListener('addtrack', textTrackListChanges);

    this.on('dispose', Fn.bind(this, function () {
      tracks.removeEventListener('removetrack', textTrackListChanges);
      tracks.removeEventListener('addtrack', textTrackListChanges);
    }));
  };

  /**
   * Initialize audio and video track listeners
   *
   * @method initTrackListeners
   */


  Tech.prototype.initTrackListeners = function initTrackListeners() {
    var _this3 = this;

    var trackTypes = ['video', 'audio'];

    trackTypes.forEach(function (type) {
      var trackListChanges = function trackListChanges() {
        _this3.trigger(type + 'trackchange');
      };

      var tracks = _this3[type + 'Tracks']();

      tracks.addEventListener('removetrack', trackListChanges);
      tracks.addEventListener('addtrack', trackListChanges);

      _this3.on('dispose', function () {
        tracks.removeEventListener('removetrack', trackListChanges);
        tracks.removeEventListener('addtrack', trackListChanges);
      });
    });
  };

  /**
   * Emulate texttracks
   *
   * @method emulateTextTracks
   */


  Tech.prototype.emulateTextTracks = function emulateTextTracks() {
    var _this4 = this;

    var tracks = this.textTracks();

    if (!tracks) {
      return;
    }

    if (!_window2['default'].WebVTT && this.el().parentNode !== null && this.el().parentNode !== undefined) {
      (function () {
        var script = _document2['default'].createElement('script');

        script.src = _this4.options_['vtt.js'] || '../node_modules/videojs-vtt.js/dist/vtt.js';
        script.onload = function () {
          _this4.trigger('vttjsloaded');
        };
        script.onerror = function () {
          _this4.trigger('vttjserror');
        };
        _this4.on('dispose', function () {
          script.onload = null;
          script.onerror = null;
        });
        // but have not loaded yet and we set it to true before the inject so that
        // we don't overwrite the injected window.WebVTT if it loads right away
        _window2['default'].WebVTT = true;
        _this4.el().parentNode.appendChild(script);
      })();
    }

    var updateDisplay = function updateDisplay() {
      return _this4.trigger('texttrackchange');
    };
    var textTracksChanges = function textTracksChanges() {
      updateDisplay();

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];

        track.removeEventListener('cuechange', updateDisplay);
        if (track.mode === 'showing') {
          track.addEventListener('cuechange', updateDisplay);
        }
      }
    };

    textTracksChanges();
    tracks.addEventListener('change', textTracksChanges);

    this.on('dispose', function () {
      tracks.removeEventListener('change', textTracksChanges);
    });
  };

  /**
   * Get videotracks
   *
   * @returns {VideoTrackList}
   * @method videoTracks
   */


  Tech.prototype.videoTracks = function videoTracks() {
    this.videoTracks_ = this.videoTracks_ || new _videoTrackList2['default']();
    return this.videoTracks_;
  };

  /**
   * Get audiotracklist
   *
   * @returns {AudioTrackList}
   * @method audioTracks
   */


  Tech.prototype.audioTracks = function audioTracks() {
    this.audioTracks_ = this.audioTracks_ || new _audioTrackList2['default']();
    return this.audioTracks_;
  };

  /*
   * Provide default methods for text tracks.
   *
   * Html5 tech overrides these.
   */

  /**
   * Get texttracks
   *
   * @returns {TextTrackList}
   * @method textTracks
   */


  Tech.prototype.textTracks = function textTracks() {
    this.textTracks_ = this.textTracks_ || new _textTrackList2['default']();
    return this.textTracks_;
  };

  /**
   * Get remote texttracks
   *
   * @returns {TextTrackList}
   * @method remoteTextTracks
   */


  Tech.prototype.remoteTextTracks = function remoteTextTracks() {
    this.remoteTextTracks_ = this.remoteTextTracks_ || new _textTrackList2['default']();
    return this.remoteTextTracks_;
  };

  /**
   * Get remote htmltrackelements
   *
   * @returns {HTMLTrackElementList}
   * @method remoteTextTrackEls
   */


  Tech.prototype.remoteTextTrackEls = function remoteTextTrackEls() {
    this.remoteTextTrackEls_ = this.remoteTextTrackEls_ || new _htmlTrackElementList2['default']();
    return this.remoteTextTrackEls_;
  };

  /**
   * Creates and returns a remote text track object
   *
   * @param {String} kind Text track kind (subtitles, captions, descriptions
   *                                       chapters and metadata)
   * @param {String=} label Label to identify the text track
   * @param {String=} language Two letter language abbreviation
   * @return {TextTrackObject}
   * @method addTextTrack
   */


  Tech.prototype.addTextTrack = function addTextTrack(kind, label, language) {
    if (!kind) {
      throw new Error('TextTrack kind is required but was not provided');
    }

    return createTrackHelper(this, kind, label, language);
  };

  /**
   * Creates a remote text track object and returns a emulated html track element
   *
   * @param {Object} options The object should contain values for
   * kind, language, label and src (location of the WebVTT file)
   * @return {HTMLTrackElement}
   * @method addRemoteTextTrack
   */


  Tech.prototype.addRemoteTextTrack = function addRemoteTextTrack(options) {
    var track = (0, _mergeOptions2['default'])(options, {
      tech: this
    });

    var htmlTrackElement = new _htmlTrackElement2['default'](track);

    // store HTMLTrackElement and TextTrack to remote list
    this.remoteTextTrackEls().addTrackElement_(htmlTrackElement);
    this.remoteTextTracks().addTrack_(htmlTrackElement.track);

    // must come after remoteTextTracks()
    this.textTracks().addTrack_(htmlTrackElement.track);

    return htmlTrackElement;
  };

  /**
   * Remove remote texttrack
   *
   * @param {TextTrackObject} track Texttrack to remove
   * @method removeRemoteTextTrack
   */


  Tech.prototype.removeRemoteTextTrack = function removeRemoteTextTrack(track) {
    this.textTracks().removeTrack_(track);

    var trackElement = this.remoteTextTrackEls().getTrackElementByTrack_(track);

    // remove HTMLTrackElement and TextTrack from remote list
    this.remoteTextTrackEls().removeTrackElement_(trackElement);
    this.remoteTextTracks().removeTrack_(track);
  };

  /**
   * Provide a default setPoster method for techs
   * Poster support for techs should be optional, so we don't want techs to
   * break if they don't have a way to set a poster.
   *
   * @method setPoster
   */


  Tech.prototype.setPoster = function setPoster() {};

  /*
   * Check if the tech can support the given type
   *
   * The base tech does not support any type, but source handlers might
   * overwrite this.
   *
   * @param  {String} type    The mimetype to check
   * @return {String}         'probably', 'maybe', or '' (empty string)
   */


  Tech.prototype.canPlayType = function canPlayType() {
    return '';
  };

  /*
   * Return whether the argument is a Tech or not.
   * Can be passed either a Class like `Html5` or a instance like `player.tech_`
   *
   * @param {Object} component An item to check
   * @return {Boolean}         Whether it is a tech or not
   */


  Tech.isTech = function isTech(component) {
    return component.prototype instanceof Tech || component instanceof Tech || component === Tech;
  };

  /**
   * Registers a Tech
   *
   * @param {String} name Name of the Tech to register
   * @param {Object} tech The tech to register
   * @static
   * @method registerComponent
   */


  Tech.registerTech = function registerTech(name, tech) {
    if (!Tech.techs_) {
      Tech.techs_ = {};
    }

    if (!Tech.isTech(tech)) {
      throw new Error('Tech ' + name + ' must be a Tech');
    }

    Tech.techs_[name] = tech;
    return tech;
  };

  /**
   * Gets a component by name
   *
   * @param {String} name Name of the component to get
   * @return {Component}
   * @static
   * @method getComponent
   */


  Tech.getTech = function getTech(name) {
    if (Tech.techs_ && Tech.techs_[name]) {
      return Tech.techs_[name];
    }

    if (_window2['default'] && _window2['default'].videojs && _window2['default'].videojs[name]) {
      _log2['default'].warn('The ' + name + ' tech was added to the videojs object when it should be registered using videojs.registerTech(name, tech)');
      return _window2['default'].videojs[name];
    }
  };

  return Tech;
}(_component2['default']);

/**
 * List of associated text tracks
 *
 * @type {TextTrackList}
 * @private
 */


Tech.prototype.textTracks_; // eslint-disable-line

/**
 * List of associated audio tracks
 *
 * @type {AudioTrackList}
 * @private
 */
Tech.prototype.audioTracks_; // eslint-disable-line

/**
 * List of associated video tracks
 *
 * @type {VideoTrackList}
 * @private
 */
Tech.prototype.videoTracks_; // eslint-disable-line

Tech.prototype.featuresVolumeControl = true;

// Resizing plugins using request fullscreen reloads the plugin
Tech.prototype.featuresFullscreenResize = false;
Tech.prototype.featuresPlaybackRate = false;

// Optional events that we can manually mimic with timers
// currently not triggered by video-js-swf
Tech.prototype.featuresProgressEvents = false;
Tech.prototype.featuresTimeupdateEvents = false;

Tech.prototype.featuresNativeTextTracks = false;

/**
 * A functional mixin for techs that want to use the Source Handler pattern.
 *
 * ##### EXAMPLE:
 *
 *   Tech.withSourceHandlers.call(MyTech);
 *
 */
Tech.withSourceHandlers = function (_Tech) {

  /**
   * Register a source handler
   * Source handlers are scripts for handling specific formats.
   * The source handler pattern is used for adaptive formats (HLS, DASH) that
   * manually load video data and feed it into a Source Buffer (Media Source Extensions)
   * @param  {Function} handler  The source handler
   * @param  {Boolean}  first    Register it before any existing handlers
   */
  _Tech.registerSourceHandler = function (handler, index) {
    var handlers = _Tech.sourceHandlers;

    if (!handlers) {
      handlers = _Tech.sourceHandlers = [];
    }

    if (index === undefined) {
      // add to the end of the list
      index = handlers.length;
    }

    handlers.splice(index, 0, handler);
  };

  /**
   * Check if the tech can support the given type
   * @param  {String} type    The mimetype to check
   * @return {String}         'probably', 'maybe', or '' (empty string)
   */
  _Tech.canPlayType = function (type) {
    var handlers = _Tech.sourceHandlers || [];
    var can = void 0;

    for (var i = 0; i < handlers.length; i++) {
      can = handlers[i].canPlayType(type);

      if (can) {
        return can;
      }
    }

    return '';
  };

  /**
   * Return the first source handler that supports the source
   * TODO: Answer question: should 'probably' be prioritized over 'maybe'
   * @param  {Object} source  The source object
   * @param  {Object} options The options passed to the tech
   * @returns {Object}       The first source handler that supports the source
   * @returns {null}         Null if no source handler is found
   */
  _Tech.selectSourceHandler = function (source, options) {
    var handlers = _Tech.sourceHandlers || [];
    var can = void 0;

    for (var i = 0; i < handlers.length; i++) {
      can = handlers[i].canHandleSource(source, options);

      if (can) {
        return handlers[i];
      }
    }

    return null;
  };

  /**
   * Check if the tech can support the given source
   * @param  {Object} srcObj  The source object
   * @param  {Object} options The options passed to the tech
   * @return {String}         'probably', 'maybe', or '' (empty string)
   */
  _Tech.canPlaySource = function (srcObj, options) {
    var sh = _Tech.selectSourceHandler(srcObj, options);

    if (sh) {
      return sh.canHandleSource(srcObj, options);
    }

    return '';
  };

  /**
   * When using a source handler, prefer its implementation of
   * any function normally provided by the tech.
   */
  var deferrable = ['seekable', 'duration'];

  deferrable.forEach(function (fnName) {
    var originalFn = this[fnName];

    if (typeof originalFn !== 'function') {
      return;
    }

    this[fnName] = function () {
      if (this.sourceHandler_ && this.sourceHandler_[fnName]) {
        return this.sourceHandler_[fnName].apply(this.sourceHandler_, arguments);
      }
      return originalFn.apply(this, arguments);
    };
  }, _Tech.prototype);

  /**
   * Create a function for setting the source using a source object
   * and source handlers.
   * Should never be called unless a source handler was found.
   * @param {Object} source  A source object with src and type keys
   * @return {Tech} self
   */
  _Tech.prototype.setSource = function (source) {
    var sh = _Tech.selectSourceHandler(source, this.options_);

    if (!sh) {
      // Fall back to a native source hander when unsupported sources are
      // deliberately set
      if (_Tech.nativeSourceHandler) {
        sh = _Tech.nativeSourceHandler;
      } else {
        _log2['default'].error('No source hander found for the current source.');
      }
    }

    // Dispose any existing source handler
    this.disposeSourceHandler();
    this.off('dispose', this.disposeSourceHandler);

    // if we have a source and get another one
    // then we are loading something new
    // than clear all of our current tracks
    if (this.currentSource_) {
      this.clearTracks(['audio', 'video']);

      this.currentSource_ = null;
    }

    if (sh !== _Tech.nativeSourceHandler) {

      this.currentSource_ = source;

      // Catch if someone replaced the src without calling setSource.
      // If they do, set currentSource_ to null and dispose our source handler.
      this.off(this.el_, 'loadstart', _Tech.prototype.firstLoadStartListener_);
      this.off(this.el_, 'loadstart', _Tech.prototype.successiveLoadStartListener_);
      this.one(this.el_, 'loadstart', _Tech.prototype.firstLoadStartListener_);
    }

    this.sourceHandler_ = sh.handleSource(source, this, this.options_);
    this.on('dispose', this.disposeSourceHandler);

    return this;
  };

  // On the first loadstart after setSource
  _Tech.prototype.firstLoadStartListener_ = function () {
    this.one(this.el_, 'loadstart', _Tech.prototype.successiveLoadStartListener_);
  };

  // On successive loadstarts when setSource has not been called again
  _Tech.prototype.successiveLoadStartListener_ = function () {
    this.currentSource_ = null;
    this.disposeSourceHandler();
    this.one(this.el_, 'loadstart', _Tech.prototype.successiveLoadStartListener_);
  };

  /*
   * Clean up any existing source handler
   */
  _Tech.prototype.disposeSourceHandler = function () {
    if (this.sourceHandler_ && this.sourceHandler_.dispose) {
      this.off(this.el_, 'loadstart', _Tech.prototype.firstLoadStartListener_);
      this.off(this.el_, 'loadstart', _Tech.prototype.successiveLoadStartListener_);
      this.sourceHandler_.dispose();
      this.sourceHandler_ = null;
    }
  };
};

_component2['default'].registerComponent('Tech', Tech);
// Old name for Tech
_component2['default'].registerComponent('MediaTechController', Tech);
Tech.registerTech('Tech', Tech);
exports['default'] = Tech;
