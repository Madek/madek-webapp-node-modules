'use strict';

exports.__esModule = true;

var _component = require('../component.js');

var _component2 = _interopRequireDefault(_component);

var _checkVolumeSupport = require('./volume-control/check-volume-support');

var _checkVolumeSupport2 = _interopRequireDefault(_checkVolumeSupport);

var _obj = require('../utils/obj');

require('./volume-control/volume-control.js');

require('./mute-toggle.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file volume-control.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


// Required children


/**
 * A Component to contain the MuteToggle and VolumeControl so that
 * they can work together.
 *
 * @extends Component
 */
var VolumePanel = function (_Component) {
  _inherits(VolumePanel, _Component);

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
  function VolumePanel(player) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, VolumePanel);

    if (typeof options.inline !== 'undefined') {
      options.inline = options.inline;
    } else {
      options.inline = true;
    }

    // pass the inline option down to the VolumeControl as vertical if
    // the VolumeControl is on.
    if (typeof options.volumeControl === 'undefined' || (0, _obj.isPlain)(options.volumeControl)) {
      options.volumeControl = options.volumeControl || {};
      options.volumeControl.vertical = !options.inline;
    }

    // hide this control if volume support is missing
    var _this = _possibleConstructorReturn(this, _Component.call(this, player, options));

    (0, _checkVolumeSupport2['default'])(_this, player);

    // while the slider is active (the mouse has been pressed down and
    // is dragging) or in focus we do not want to hide the VolumeBar
    _this.on(_this.volumeControl, ['slideractive'], _this.sliderActive_);
    _this.on(_this.muteToggle, 'focus', _this.sliderActive_);

    _this.on(_this.volumeControl, ['sliderinactive'], _this.sliderInactive_);
    _this.on(_this.muteToggle, 'blur', _this.sliderInactive_);
    return _this;
  }

  /**
   * Add vjs-slider-active class to the VolumePanel
   *
   * @listens VolumeControl#slideractive
   * @private
   */


  VolumePanel.prototype.sliderActive_ = function sliderActive_() {
    this.addClass('vjs-slider-active');
  };

  /**
   * Removes vjs-slider-active class to the VolumePanel
   *
   * @listens VolumeControl#sliderinactive
   * @private
   */


  VolumePanel.prototype.sliderInactive_ = function sliderInactive_() {
    this.removeClass('vjs-slider-active');
  };

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */


  VolumePanel.prototype.createEl = function createEl() {
    var orientationClass = 'vjs-volume-panel-horizontal';

    if (!this.options_.inline) {
      orientationClass = 'vjs-volume-panel-vertical';
    }

    return _Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-volume-panel vjs-control ' + orientationClass
    });
  };

  return VolumePanel;
}(_component2['default']);

/**
 * Default options for the `VolumeControl`
 *
 * @type {Object}
 * @private
 */


VolumePanel.prototype.options_ = {
  children: ['muteToggle', 'volumeControl']
};

_component2['default'].registerComponent('VolumePanel', VolumePanel);
exports['default'] = VolumePanel;
