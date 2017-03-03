'use strict';

exports.__esModule = true;

var _button = require('../button');

var _button2 = _interopRequireDefault(_button);

var _component = require('../component');

var _component2 = _interopRequireDefault(_component);

var _dom = require('../utils/dom.js');

var Dom = _interopRequireWildcard(_dom);

var _checkVolumeSupport = require('./volume-control/check-volume-support');

var _checkVolumeSupport2 = _interopRequireDefault(_checkVolumeSupport);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file mute-toggle.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * A button component for muting the audio.
 *
 * @extends Button
 */
var MuteToggle = function (_Button) {
  _inherits(MuteToggle, _Button);

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  function MuteToggle(player, options) {
    _classCallCheck(this, MuteToggle);

    // hide this control if volume support is missing
    var _this = _possibleConstructorReturn(this, _Button.call(this, player, options));

    (0, _checkVolumeSupport2['default'])(_this, player);

    _this.on(player, ['loadstart', 'volumechange'], _this.update);
    return _this;
  }

  /**
   * Builds the default DOM `className`.
   *
   * @return {string}
   *         The DOM `className` for this object.
   */


  MuteToggle.prototype.buildCSSClass = function buildCSSClass() {
    return 'vjs-mute-control ' + _Button.prototype.buildCSSClass.call(this);
  };

  /**
   * This gets called when an `MuteToggle` is "clicked". See
   * {@link ClickableComponent} for more detailed information on what a click can be.
   *
   * @param {EventTarget~Event} [event]
   *        The `keydown`, `tap`, or `click` event that caused this function to be
   *        called.
   *
   * @listens tap
   * @listens click
   */


  MuteToggle.prototype.handleClick = function handleClick(event) {
    var vol = this.player_.volume();
    var lastVolume = this.player_.lastVolume_();

    if (vol === 0) {
      this.player_.volume(lastVolume);
      this.player_.muted(false);
    } else {
      this.player_.muted(this.player_.muted() ? false : true);
    }
  };

  /**
   * Update the `MuteToggle` button based on the state of `volume` and `muted`
   * on the player.
   *
   * @param {EventTarget~Event} [event]
   *        The {@link Player#loadstart} event if this function was called
   *        through an event.
   *
   * @listens Player#loadstart
   * @listens Player#volumechange
   */


  MuteToggle.prototype.update = function update(event) {
    this.updateIcon_();
    this.updateControlText_();
  };

  /**
   * Update the appearance of the `MuteToggle` icon.
   *
   * Possible states (given `level` variable below):
   * - 0: crossed out
   * - 1: zero bars of volume
   * - 2: one bar of volume
   * - 3: two bars of volume
   *
   * @private
   */


  MuteToggle.prototype.updateIcon_ = function updateIcon_() {
    var vol = this.player_.volume();
    var level = 3;

    if (vol === 0 || this.player_.muted()) {
      level = 0;
    } else if (vol < 0.33) {
      level = 1;
    } else if (vol < 0.67) {
      level = 2;
    }

    // TODO improve muted icon classes
    for (var i = 0; i < 4; i++) {
      Dom.removeClass(this.el_, 'vjs-vol-' + i);
    }
    Dom.addClass(this.el_, 'vjs-vol-' + level);
  };

  /**
   * If `muted` has changed on the player, update the control text
   * (`title` attribute on `vjs-mute-control` element and content of
   * `vjs-control-text` element).
   *
   * @private
   */


  MuteToggle.prototype.updateControlText_ = function updateControlText_() {
    var soundOff = this.player_.muted() || this.player_.volume() === 0;
    var text = soundOff ? 'Unmute' : 'Mute';

    if (this.controlText() !== text) {
      this.controlText(text);
    }
  };

  return MuteToggle;
}(_button2['default']);

/**
 * The text that should display over the `MuteToggle`s controls. Added for localization.
 *
 * @type {string}
 * @private
 */


MuteToggle.prototype.controlText_ = 'Mute';

_component2['default'].registerComponent('MuteToggle', MuteToggle);
exports['default'] = MuteToggle;
