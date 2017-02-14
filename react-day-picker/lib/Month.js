'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Month;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _PropTypes = require('./PropTypes');

var _PropTypes2 = _interopRequireDefault(_PropTypes);

var _Weekdays = require('./Weekdays');

var _Weekdays2 = _interopRequireDefault(_Weekdays);

var _Helpers = require('./Helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Month(_ref) {
  var month = _ref.month,
      months = _ref.months,
      weekdaysLong = _ref.weekdaysLong,
      weekdaysShort = _ref.weekdaysShort,
      locale = _ref.locale,
      localeUtils = _ref.localeUtils,
      captionElement = _ref.captionElement,
      onCaptionClick = _ref.onCaptionClick,
      children = _ref.children,
      firstDayOfWeek = _ref.firstDayOfWeek,
      className = _ref.className,
      wrapperClassName = _ref.wrapperClassName,
      weekClassName = _ref.weekClassName,
      weekdayElement = _ref.weekdayElement,
      fixedWeeks = _ref.fixedWeeks;

  var captionProps = {
    date: month,
    months: months,
    localeUtils: localeUtils,
    locale: locale,
    onClick: onCaptionClick ? function (e) {
      return onCaptionClick(e, month);
    } : undefined
  };
  var weeks = (0, _Helpers.getWeekArray)(month, firstDayOfWeek, fixedWeeks);
  return _react2.default.createElement(
    'div',
    { className: className },
    _react2.default.cloneElement(captionElement, captionProps),
    _react2.default.createElement(_Weekdays2.default, {
      weekdaysShort: weekdaysShort,
      weekdaysLong: weekdaysLong,
      firstDayOfWeek: firstDayOfWeek,
      locale: locale,
      localeUtils: localeUtils,
      weekdayElement: weekdayElement
    }),
    _react2.default.createElement(
      'div',
      { className: wrapperClassName, role: 'grid' },
      weeks.map(function (week, j) {
        return _react2.default.createElement(
          'div',
          { key: j, className: weekClassName, role: 'gridcell' },
          week.map(function (day) {
            return children(day, month);
          })
        );
      })
    )
  );
}

Month.propTypes = {
  month: _react.PropTypes.instanceOf(Date).isRequired,
  months: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string),
  captionElement: _react.PropTypes.node.isRequired,
  firstDayOfWeek: _react.PropTypes.number.isRequired,
  weekdaysLong: _react.PropTypes.arrayOf(_react.PropTypes.string),
  weekdaysShort: _react.PropTypes.arrayOf(_react.PropTypes.string),
  locale: _react.PropTypes.string.isRequired,
  localeUtils: _PropTypes2.default.localeUtils.isRequired,
  onCaptionClick: _react.PropTypes.func,
  children: _react.PropTypes.func.isRequired,
  className: _react.PropTypes.string,
  wrapperClassName: _react.PropTypes.string,
  weekClassName: _react.PropTypes.string,
  weekdayElement: _react.PropTypes.element,
  fixedWeeks: _react.PropTypes.bool
};
//# sourceMappingURL=Month.js.map