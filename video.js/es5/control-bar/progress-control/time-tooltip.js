'use strict';

exports.__esModule = true;

var _component = require('../../component');

var _component2 = _interopRequireDefault(_component);

var _dom = require('../../utils/dom.js');

var Dom = _interopRequireWildcard(_dom);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @file time-tooltip.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * Time tooltips display a time above the progress bar.
 *
 * @extends Component
 */
var TimeTooltip = function (_Component) {
  _inherits(TimeTooltip, _Component);

  function TimeTooltip() {
    _classCallCheck(this, TimeTooltip);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  /**
   * Create the time tooltip DOM element
   *
   * @return {Element}
   *         The element that was created.
   */
  TimeTooltip.prototype.createEl = function createEl() {
    return _Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-time-tooltip'
    });
  };

  /**
   * Updates the position of the time tooltip relative to the `SeekBar`.
   *
   * @param {Object} seekBarRect
   *        The `ClientRect` for the {@link SeekBar} element.
   *
   * @param {number} seekBarPoint
   *        A number from 0 to 1, representing a horizontal reference point
   *        from the left edge of the {@link SeekBar}
   */


  TimeTooltip.prototype.update = function update(seekBarRect, seekBarPoint, content) {
    var tooltipRect = Dom.getBoundingClientRect(this.el_);
    var playerRect = Dom.getBoundingClientRect(this.player_.el());
    var seekBarPointPx = seekBarRect.width * seekBarPoint;

    // do nothing if either rect isn't available
    // for example, if the player isn't in the DOM for testing
    if (!playerRect || !tooltipRect) {
      return;
    }

    // This is the space left of the `seekBarPoint` available within the bounds
    // of the player. We calculate any gap between the left edge of the player
    // and the left edge of the `SeekBar` and add the number of pixels in the
    // `SeekBar` before hitting the `seekBarPoint`
    var spaceLeftOfPoint = seekBarRect.left - playerRect.left + seekBarPointPx;

    // This is the space right of the `seekBarPoint` available within the bounds
    // of the player. We calculate the number of pixels from the `seekBarPoint`
    // to the right edge of the `SeekBar` and add to that any gap between the
    // right edge of the `SeekBar` and the player.
    var spaceRightOfPoint = seekBarRect.width - seekBarPointPx + (playerRect.right - seekBarRect.right);

    // This is the number of pixels by which the tooltip will need to be pulled
    // further to the right to center it over the `seekBarPoint`.
    var pullTooltipBy = tooltipRect.width / 2;

    // Adjust the `pullTooltipBy` distance to the left or right depending on
    // the results of the space calculations above.
    if (spaceLeftOfPoint < pullTooltipBy) {
      pullTooltipBy += pullTooltipBy - spaceLeftOfPoint;
    } else if (spaceRightOfPoint < pullTooltipBy) {
      pullTooltipBy = spaceRightOfPoint;
    }

    // Due to the imprecision of decimal/ratio based calculations and varying
    // rounding behaviors, there are cases where the spacing adjustment is off
    // by a pixel or two. This adds insurance to these calculations.
    if (pullTooltipBy < 0) {
      pullTooltipBy = 0;
    } else if (pullTooltipBy > tooltipRect.width) {
      pullTooltipBy = tooltipRect.width;
    }

    this.el_.style.right = '-' + pullTooltipBy + 'px';
    Dom.textContent(this.el_, content);
  };

  return TimeTooltip;
}(_component2['default']);

_component2['default'].registerComponent('TimeTooltip', TimeTooltip);
exports['default'] = TimeTooltip;
