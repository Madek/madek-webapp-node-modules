'use strict';

exports.__esModule = true;

var _component = require('../../component.js');

var _component2 = _interopRequireDefault(_component);

var _fn = require('../../utils/fn.js');

var Fn = _interopRequireWildcard(_fn);

var _formatTime = require('../../utils/format-time.js');

var _formatTime2 = _interopRequireDefault(_formatTime);

require('./time-tooltip');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file mouse-time-display.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * The {@link MouseTimeDisplay} component tracks mouse movement over the
 * {@link ProgressControl}. It displays an indicator and a {@link TimeTooltip}
 * indicating the time which is represented by a given point in the
 * {@link ProgressControl}.
 *
 * @extends Component
 */
var MouseTimeDisplay = function (_Component) {
  _inherits(MouseTimeDisplay, _Component);

  /**
   * Creates an instance of this class.
   *
   * @param {Player} player
   *        The {@link Player} that this class should be attached to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   */
  function MouseTimeDisplay(player, options) {
    _classCallCheck(this, MouseTimeDisplay);

    var _this = _possibleConstructorReturn(this, _Component.call(this, player, options));

    _this.update = Fn.throttle(Fn.bind(_this, _this.update), 25);
    return _this;
  }

  /**
   * Create the DOM element for this class.
   *
   * @return {Element}
   *         The element that was created.
   */


  MouseTimeDisplay.prototype.createEl = function createEl() {
    return _Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-mouse-display'
    });
  };

  /**
   * Enqueues updates to its own DOM as well as the DOM of its
   * {@link TimeTooltip} child.
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   */


  MouseTimeDisplay.prototype.update = function update(seekBarRect, seekBarPoint) {
    var _this2 = this;

    // If there is an existing rAF ID, cancel it so we don't over-queue.
    if (this.rafId_) {
      this.cancelAnimationFrame(this.rafId_);
    }

    this.rafId_ = this.requestAnimationFrame(function () {
      var duration = _this2.player_.duration();
      var content = (0, _formatTime2['default'])(seekBarPoint * duration, duration);

      _this2.el_.style.left = seekBarRect.width * seekBarPoint + 'px';
      _this2.getChild('timeTooltip').update(seekBarRect, seekBarPoint, content);
    });
  };

  return MouseTimeDisplay;
}(_component2['default']);

/**
 * Default options for `MouseTimeDisplay`
 *
 * @type {Object}
 * @private
 */


MouseTimeDisplay.prototype.options_ = {
  children: ['timeTooltip']
};

_component2['default'].registerComponent('MouseTimeDisplay', MouseTimeDisplay);
exports['default'] = MouseTimeDisplay;
