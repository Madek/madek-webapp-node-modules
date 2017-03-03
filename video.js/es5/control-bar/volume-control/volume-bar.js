'use strict';

exports.__esModule = true;

var _slider = require('../../slider/slider.js');

var _slider2 = _interopRequireDefault(_slider);

var _component = require('../../component.js');

var _component2 = _interopRequireDefault(_component);

require('./volume-level.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file volume-bar.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


// Required children


/**
 * The bar that contains the volume level and can be clicked on to adjust the level
 *
 * @extends Slider
 */
var VolumeBar = function (_Slider) {
  _inherits(VolumeBar, _Slider);

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  function VolumeBar(player, options) {
    _classCallCheck(this, VolumeBar);

    var _this = _possibleConstructorReturn(this, _Slider.call(this, player, options));

    _this.on('slideractive', _this.updateLastVolume_);
    _this.on(player, 'volumechange', _this.updateARIAAttributes);
    player.ready(function () {
      return _this.updateARIAAttributes();
    });
    return _this;
  }

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */


  VolumeBar.prototype.createEl = function createEl() {
    return _Slider.prototype.createEl.call(this, 'div', {
      className: 'vjs-volume-bar vjs-slider-bar'
    }, {
      'aria-label': this.localize('Volume Level'),
      'aria-live': 'polite'
    });
  };

  /**
   * Handle movement events on the {@link VolumeMenuButton}.
   *
   * @param {EventTarget~Event} event
   *        The event that caused this function to run.
   *
   * @listens mousemove
   */


  VolumeBar.prototype.handleMouseMove = function handleMouseMove(event) {
    this.checkMuted();
    this.player_.volume(this.calculateDistance(event));
  };

  /**
   * If the player is muted unmute it.
   */


  VolumeBar.prototype.checkMuted = function checkMuted() {
    if (this.player_.muted()) {
      this.player_.muted(false);
    }
  };

  /**
   * Get percent of volume level
   *
   * @return {number}
   *         Volume level percent as a decimal number.
   */


  VolumeBar.prototype.getPercent = function getPercent() {
    if (this.player_.muted()) {
      return 0;
    }
    return this.player_.volume();
  };

  /**
   * Increase volume level for keyboard users
   */


  VolumeBar.prototype.stepForward = function stepForward() {
    this.checkMuted();
    this.player_.volume(this.player_.volume() + 0.1);
  };

  /**
   * Decrease volume level for keyboard users
   */


  VolumeBar.prototype.stepBack = function stepBack() {
    this.checkMuted();
    this.player_.volume(this.player_.volume() - 0.1);
  };

  /**
   * Update ARIA accessibility attributes
   *
   * @param {EventTarget~Event} [event]
   *        The `volumechange` event that caused this function to run.
   *
   * @listens Player#volumechange
   */


  VolumeBar.prototype.updateARIAAttributes = function updateARIAAttributes(event) {
    var ariaValue = this.player_.muted() ? 0 : this.volumeAsPercentage_();

    this.el_.setAttribute('aria-valuenow', ariaValue);
    this.el_.setAttribute('aria-valuetext', ariaValue + '%');
  };

  /**
   * Returns the current value of the player volume as a percentage
   *
   * @private
   */


  VolumeBar.prototype.volumeAsPercentage_ = function volumeAsPercentage_() {
    return Math.round(this.player_.volume() * 100);
  };

  /**
   * When user starts dragging the VolumeBar, store the volume and listen for
   * the end of the drag. When the drag ends, if the volume was set to zero,
   * set lastVolume to the stored volume.
   *
   * @listens slideractive
   * @private
   */


  VolumeBar.prototype.updateLastVolume_ = function updateLastVolume_() {
    var _this2 = this;

    var volumeBeforeDrag = this.player_.volume();

    this.one('sliderinactive', function () {
      if (_this2.player_.volume() === 0) {
        _this2.player_.lastVolume_(volumeBeforeDrag);
      }
    });
  };

  return VolumeBar;
}(_slider2['default']);

/**
 * Default options for the `VolumeBar`
 *
 * @type {Object}
 * @private
 */


VolumeBar.prototype.options_ = {
  children: ['volumeLevel'],
  barName: 'volumeLevel'
};

/**
 * Call the update event for this Slider when this event happens on the player.
 *
 * @type {string}
 */
VolumeBar.prototype.playerEvent = 'volumechange';

_component2['default'].registerComponent('VolumeBar', VolumeBar);
exports['default'] = VolumeBar;
