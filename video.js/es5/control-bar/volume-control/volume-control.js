'use strict';

exports.__esModule = true;

var _component = require('../../component.js');

var _component2 = _interopRequireDefault(_component);

var _checkVolumeSupport = require('./check-volume-support');

var _checkVolumeSupport2 = _interopRequireDefault(_checkVolumeSupport);

var _obj = require('../../utils/obj');

var _fn = require('../../utils/fn.js');

require('./volume-bar.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file volume-control.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


// Required children


/**
 * The component for controlling the volume level
 *
 * @extends Component
 */
var VolumeControl = function (_Component) {
  _inherits(VolumeControl, _Component);

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options={}]
   *        The key/value store of player options.
   */
  function VolumeControl(player) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, VolumeControl);

    options.vertical = options.vertical || false;

    // Pass the vertical option down to the VolumeBar if
    // the VolumeBar is turned on.
    if (typeof options.volumeBar === 'undefined' || (0, _obj.isPlain)(options.volumeBar)) {
      options.volumeBar = options.volumeBar || {};
      options.volumeBar.vertical = options.vertical;
    }

    // hide this control if volume support is missing
    var _this = _possibleConstructorReturn(this, _Component.call(this, player, options));

    (0, _checkVolumeSupport2['default'])(_this, player);

    _this.throttledHandleMouseMove = (0, _fn.throttle)((0, _fn.bind)(_this, _this.handleMouseMove), 25);

    _this.on('mousedown', _this.handleMouseDown);
    _this.on('touchstart', _this.handleMouseDown);

    // while the slider is active (the mouse has been pressed down and
    // is dragging) or in focus we do not want to hide the VolumeBar
    _this.on(_this.volumeBar, ['focus', 'slideractive'], function () {
      _this.volumeBar.addClass('vjs-slider-active');
      _this.addClass('vjs-slider-active');
      _this.trigger('slideractive');
    });

    _this.on(_this.volumeBar, ['blur', 'sliderinactive'], function () {
      _this.volumeBar.removeClass('vjs-slider-active');
      _this.removeClass('vjs-slider-active');
      _this.trigger('sliderinactive');
    });
    return _this;
  }

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */


  VolumeControl.prototype.createEl = function createEl() {
    var orientationClass = 'vjs-volume-horizontal';

    if (this.options_.vertical) {
      orientationClass = 'vjs-volume-vertical';
    }

    return _Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-volume-control vjs-control ' + orientationClass
    });
  };

  /**
   * Handle `mousedown` or `touchstart` events on the `VolumeControl`.
   *
   * @param {EventTarget~Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   * @listens touchstart
   */


  VolumeControl.prototype.handleMouseDown = function handleMouseDown(event) {
    var doc = this.el_.ownerDocument;

    this.on(doc, 'mousemove', this.throttledHandleMouseMove);
    this.on(doc, 'touchmove', this.throttledHandleMouseMove);
    this.on(doc, 'mouseup', this.handleMouseUp);
    this.on(doc, 'touchend', this.handleMouseUp);
  };

  /**
   * Handle `mouseup` or `touchend` events on the `VolumeControl`.
   *
   * @param {EventTarget~Event} event
   *        `mouseup` or `touchend` event that triggered this function.
   *
   * @listens touchend
   * @listens mouseup
   */


  VolumeControl.prototype.handleMouseUp = function handleMouseUp(event) {
    var doc = this.el_.ownerDocument;

    this.off(doc, 'mousemove', this.throttledHandleMouseMove);
    this.off(doc, 'touchmove', this.throttledHandleMouseMove);
    this.off(doc, 'mouseup', this.handleMouseUp);
    this.off(doc, 'touchend', this.handleMouseUp);
  };

  /**
   * Handle `mousedown` or `touchstart` events on the `VolumeControl`.
   *
   * @param {EventTarget~Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   * @listens touchstart
   */


  VolumeControl.prototype.handleMouseMove = function handleMouseMove(event) {
    this.volumeBar.handleMouseMove(event);
  };

  return VolumeControl;
}(_component2['default']);

/**
 * Default options for the `VolumeControl`
 *
 * @type {Object}
 * @private
 */


VolumeControl.prototype.options_ = {
  children: ['volumeBar']
};

_component2['default'].registerComponent('VolumeControl', VolumeControl);
exports['default'] = VolumeControl;
