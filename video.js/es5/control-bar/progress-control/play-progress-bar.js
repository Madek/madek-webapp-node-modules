'use strict';

exports.__esModule = true;

var _component = require('../../component.js');

var _component2 = _interopRequireDefault(_component);

var _browser = require('../../utils/browser.js');

var _formatTime = require('../../utils/format-time.js');

var _formatTime2 = _interopRequireDefault(_formatTime);

require('./time-tooltip');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file play-progress-bar.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * Used by {@link SeekBar} to display media playback progress as part of the
 * {@link ProgressControl}.
 *
 * @extends Component
 */
var PlayProgressBar = function (_Component) {
  _inherits(PlayProgressBar, _Component);

  function PlayProgressBar() {
    _classCallCheck(this, PlayProgressBar);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  /**
   * Create the the DOM element for this class.
   *
   * @return {Element}
   *         The element that was created.
   */
  PlayProgressBar.prototype.createEl = function createEl() {
    return _Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-play-progress vjs-slider-bar',
      innerHTML: '<span class="vjs-control-text"><span>' + this.localize('Progress') + '</span>: 0%</span>'
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


  PlayProgressBar.prototype.update = function update(seekBarRect, seekBarPoint) {
    var _this2 = this;

    // If there is an existing rAF ID, cancel it so we don't over-queue.
    if (this.rafId_) {
      this.cancelAnimationFrame(this.rafId_);
    }

    this.rafId_ = this.requestAnimationFrame(function () {
      var time = _this2.player_.scrubbing() ? _this2.player_.getCache().currentTime : _this2.player_.currentTime();

      var content = (0, _formatTime2['default'])(time, _this2.player_.duration());

      _this2.getChild('timeTooltip').update(seekBarRect, seekBarPoint, content);
    });
  };

  return PlayProgressBar;
}(_component2['default']);

/**
 * Default options for {@link PlayProgressBar}.
 *
 * @type {Object}
 * @private
 */


PlayProgressBar.prototype.options_ = {
  children: []
};

if (!_browser.IE_VERSION || _browser.IE_VERSION > 8) {
  PlayProgressBar.prototype.options_.children.push('timeTooltip');
}

_component2['default'].registerComponent('PlayProgressBar', PlayProgressBar);
exports['default'] = PlayProgressBar;
