'use strict';

exports.__esModule = true;

var _component = require('../../component.js');

var _component2 = _interopRequireDefault(_component);

var _dom = require('../../utils/dom.js');

var Dom = _interopRequireWildcard(_dom);

var _fn = require('../../utils/fn.js');

require('./seek-bar.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file progress-control.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * The Progress Control component contains the seek bar, load progress,
 * and play progress.
 *
 * @extends Component
 */
var ProgressControl = function (_Component) {
  _inherits(ProgressControl, _Component);

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  function ProgressControl(player, options) {
    _classCallCheck(this, ProgressControl);

    var _this = _possibleConstructorReturn(this, _Component.call(this, player, options));

    _this.handleMouseMove = (0, _fn.throttle)((0, _fn.bind)(_this, _this.handleMouseMove), 25);
    _this.on(_this.el_, 'mousemove', _this.handleMouseMove);

    _this.throttledHandleMouseSeek = (0, _fn.throttle)((0, _fn.bind)(_this, _this.handleMouseSeek), 25);
    _this.on(['mousedown', 'touchstart'], _this.handleMouseDown);
    return _this;
  }

  /**
   * Create the `Component`'s DOM element
   *
   * @return {Element}
   *         The element that was created.
   */


  ProgressControl.prototype.createEl = function createEl() {
    return _Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-progress-control vjs-control'
    });
  };

  /**
   * When the mouse moves over the `ProgressControl`, the pointer position
   * gets passed down to the `MouseTimeDisplay` component.
   *
   * @param {EventTarget~Event} event
   *        The `mousemove` event that caused this function to run.
   *
   * @listen mousemove
   */


  ProgressControl.prototype.handleMouseMove = function handleMouseMove(event) {
    var seekBar = this.getChild('seekBar');
    var mouseTimeDisplay = seekBar.getChild('mouseTimeDisplay');
    var seekBarEl = seekBar.el();
    var seekBarRect = Dom.getBoundingClientRect(seekBarEl);
    var seekBarPoint = Dom.getPointerPosition(seekBarEl, event).x;

    // The default skin has a gap on either side of the `SeekBar`. This means
    // that it's possible to trigger this behavior outside the boundaries of
    // the `SeekBar`. This ensures we stay within it at all times.
    if (seekBarPoint > 1) {
      seekBarPoint = 1;
    } else if (seekBarPoint < 0) {
      seekBarPoint = 0;
    }

    if (mouseTimeDisplay) {
      mouseTimeDisplay.update(seekBarRect, seekBarPoint);
    }
  };

  /**
   * A throttled version of the {@link ProgressControl#handleMouseSeek} listener.
   *
   * @method ProgressControl#throttledHandleMouseSeek
   * @param {EventTarget~Event} event
   *        The `mousemove` event that caused this function to run.
   *
   * @listen mousemove
   * @listen touchmove
   */

  /**
   * Handle `mousemove` or `touchmove` events on the `ProgressControl`.
   *
   * @param {EventTarget~Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousemove
   * @listens touchmove
   */


  ProgressControl.prototype.handleMouseSeek = function handleMouseSeek(event) {
    var seekBar = this.getChild('seekBar');

    seekBar.handleMouseMove(event);
  };

  /**
   * Handle `mousedown` or `touchstart` events on the `ProgressControl`.
   *
   * @param {EventTarget~Event} event
   *        `mousedown` or `touchstart` event that triggered this function
   *
   * @listens mousedown
   * @listens touchstart
   */


  ProgressControl.prototype.handleMouseDown = function handleMouseDown(event) {
    var doc = this.el_.ownerDocument;

    this.on(doc, 'mousemove', this.throttledHandleMouseSeek);
    this.on(doc, 'touchmove', this.throttledHandleMouseSeek);
    this.on(doc, 'mouseup', this.handleMouseUp);
    this.on(doc, 'touchend', this.handleMouseUp);
  };

  /**
   * Handle `mouseup` or `touchend` events on the `ProgressControl`.
   *
   * @param {EventTarget~Event} event
   *        `mouseup` or `touchend` event that triggered this function.
   *
   * @listens touchend
   * @listens mouseup
   */


  ProgressControl.prototype.handleMouseUp = function handleMouseUp(event) {
    var doc = this.el_.ownerDocument;

    this.off(doc, 'mousemove', this.throttledHandleMouseSeek);
    this.off(doc, 'touchmove', this.throttledHandleMouseSeek);
    this.off(doc, 'mouseup', this.handleMouseUp);
    this.off(doc, 'touchend', this.handleMouseUp);
  };

  return ProgressControl;
}(_component2['default']);

/**
 * Default options for `ProgressControl`
 *
 * @type {Object}
 * @private
 */


ProgressControl.prototype.options_ = {
  children: ['seekBar']
};

_component2['default'].registerComponent('ProgressControl', ProgressControl);
exports['default'] = ProgressControl;
