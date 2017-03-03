'use strict';

exports.__esModule = true;

var _slider = require('../../slider/slider.js');

var _slider2 = _interopRequireDefault(_slider);

var _component = require('../../component.js');

var _component2 = _interopRequireDefault(_component);

var _browser = require('../../utils/browser.js');

var _dom = require('../../utils/dom.js');

var Dom = _interopRequireWildcard(_dom);

var _fn = require('../../utils/fn.js');

var Fn = _interopRequireWildcard(_fn);

var _formatTime = require('../../utils/format-time.js');

var _formatTime2 = _interopRequireDefault(_formatTime);

require('./load-progress-bar.js');

require('./play-progress-bar.js');

require('./mouse-time-display.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file seek-bar.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


// The number of seconds the `step*` functions move the timeline.
var STEP_SECONDS = 5;

/**
 * Seek bar and container for the progress bars. Uses {@link PlayProgressBar}
 * as its `bar`.
 *
 * @extends Slider
 */

var SeekBar = function (_Slider) {
  _inherits(SeekBar, _Slider);

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  function SeekBar(player, options) {
    _classCallCheck(this, SeekBar);

    var _this = _possibleConstructorReturn(this, _Slider.call(this, player, options));

    _this.update = Fn.throttle(Fn.bind(_this, _this.update), 50);
    _this.on(player, ['timeupdate', 'ended'], _this.update);
    return _this;
  }

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */


  SeekBar.prototype.createEl = function createEl() {
    return _Slider.prototype.createEl.call(this, 'div', {
      className: 'vjs-progress-holder'
    }, {
      'aria-label': this.localize('Progress Bar')
    });
  };

  /**
   * Update the seek bar's UI.
   *
   * @param {EventTarget~Event} [event]
   *        The `timeupdate` or `ended` event that caused this to run.
   *
   * @listens Player#timeupdate
   * @listens Player#ended
   */


  SeekBar.prototype.update = function update() {
    var percent = _Slider.prototype.update.call(this);
    var duration = this.player_.duration();

    // Allows for smooth scrubbing, when player can't keep up.
    var time = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();

    // machine readable value of progress bar (percentage complete)
    this.el_.setAttribute('aria-valuenow', (percent * 100).toFixed(2));

    // human readable value of progress bar (time complete)
    this.el_.setAttribute('aria-valuetext', this.localize('progress bar timing: currentTime={1} duration={2}', [(0, _formatTime2['default'])(time, duration), (0, _formatTime2['default'])(duration, duration)], '{1} of {2}'));

    // Update the `PlayProgressBar`.
    this.bar.update(Dom.getBoundingClientRect(this.el_), percent);

    return percent;
  };

  /**
   * Get the percentage of media played so far.
   *
   * @return {number}
   *         The percentage of media played so far (0 to 1).
   */


  SeekBar.prototype.getPercent = function getPercent() {

    // Allows for smooth scrubbing, when player can't keep up.
    var time = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();

    var percent = time / this.player_.duration();

    return percent >= 1 ? 1 : percent;
  };

  /**
   * Handle mouse down on seek bar
   *
   * @param {EventTarget~Event} event
   *        The `mousedown` event that caused this to run.
   *
   * @listens mousedown
   */


  SeekBar.prototype.handleMouseDown = function handleMouseDown(event) {
    this.player_.scrubbing(true);

    this.videoWasPlaying = !this.player_.paused();
    this.player_.pause();

    _Slider.prototype.handleMouseDown.call(this, event);
  };

  /**
   * Handle mouse move on seek bar
   *
   * @param {EventTarget~Event} event
   *        The `mousemove` event that caused this to run.
   *
   * @listens mousemove
   */


  SeekBar.prototype.handleMouseMove = function handleMouseMove(event) {
    var newTime = this.calculateDistance(event) * this.player_.duration();

    // Don't let video end while scrubbing.
    if (newTime === this.player_.duration()) {
      newTime = newTime - 0.1;
    }

    // Set new time (tell player to seek to new time)
    this.player_.currentTime(newTime);
  };

  /**
   * Handle mouse up on seek bar
   *
   * @param {EventTarget~Event} event
   *        The `mouseup` event that caused this to run.
   *
   * @listens mouseup
   */


  SeekBar.prototype.handleMouseUp = function handleMouseUp(event) {
    _Slider.prototype.handleMouseUp.call(this, event);

    this.player_.scrubbing(false);
    if (this.videoWasPlaying) {
      this.player_.play();
    }
  };

  /**
   * Move more quickly fast forward for keyboard-only users
   */


  SeekBar.prototype.stepForward = function stepForward() {
    this.player_.currentTime(this.player_.currentTime() + STEP_SECONDS);
  };

  /**
   * Move more quickly rewind for keyboard-only users
   */


  SeekBar.prototype.stepBack = function stepBack() {
    this.player_.currentTime(this.player_.currentTime() - STEP_SECONDS);
  };

  /**
   * Toggles the playback state of the player
   * This gets called when enter or space is used on the seekbar
   *
   * @param {EventTarget~Event} event
   *        The `keydown` event that caused this function to be called
   *
   */


  SeekBar.prototype.handleAction = function handleAction(event) {
    if (this.player_.paused()) {
      this.player_.play();
    } else {
      this.player_.pause();
    }
  };

  /**
   * Called when this SeekBar has focus and a key gets pressed down. By
   * default it will call `this.handleAction` when the key is space or enter.
   *
   * @param {EventTarget~Event} event
   *        The `keydown` event that caused this function to be called.
   *
   * @listens keydown
   */


  SeekBar.prototype.handleKeyPress = function handleKeyPress(event) {

    // Support Space (32) or Enter (13) key operation to fire a click event
    if (event.which === 32 || event.which === 13) {
      event.preventDefault();
      this.handleAction(event);
    } else if (_Slider.prototype.handleKeyPress) {

      // Pass keypress handling up for unsupported keys
      _Slider.prototype.handleKeyPress.call(this, event);
    }
  };

  return SeekBar;
}(_slider2['default']);

/**
 * Default options for the `SeekBar`
 *
 * @type {Object}
 * @private
 */


SeekBar.prototype.options_ = {
  children: ['loadProgressBar', 'playProgressBar'],
  barName: 'playProgressBar'
};

if (!_browser.IE_VERSION || _browser.IE_VERSION > 8) {
  SeekBar.prototype.options_.children.splice(1, 0, 'mouseTimeDisplay');
}

/**
 * Call the update event for this Slider when this event happens on the player.
 *
 * @type {string}
 */
SeekBar.prototype.playerEvent = 'timeupdate';

_component2['default'].registerComponent('SeekBar', SeekBar);
exports['default'] = SeekBar;
