'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _consolidatedEvents = require('consolidated-events');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _computeOffsetPixels = require('./computeOffsetPixels');

var _computeOffsetPixels2 = _interopRequireDefault(_computeOffsetPixels);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _debugLog = require('./debugLog');

var _debugLog2 = _interopRequireDefault(_debugLog);

var _ensureChildrenIsSingleDOMElement = require('./ensureChildrenIsSingleDOMElement');

var _ensureChildrenIsSingleDOMElement2 = _interopRequireDefault(_ensureChildrenIsSingleDOMElement);

var _getCurrentPosition = require('./getCurrentPosition');

var _getCurrentPosition2 = _interopRequireDefault(_getCurrentPosition);

var _onNextTick = require('./onNextTick');

var _onNextTick2 = _interopRequireDefault(_onNextTick);

var _resolveScrollableAncestorProp = require('./resolveScrollableAncestorProp');

var _resolveScrollableAncestorProp2 = _interopRequireDefault(_resolveScrollableAncestorProp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultProps = {
  topOffset: '0px',
  bottomOffset: '0px',
  horizontal: false,
  onEnter: function onEnter() {},
  onLeave: function onLeave() {},
  onPositionChange: function onPositionChange() {},

  fireOnRapidScroll: true
};

/**
 * Calls a function when you scroll to the element.
 */

var Waypoint = function (_React$Component) {
  _inherits(Waypoint, _React$Component);

  function Waypoint(props) {
    _classCallCheck(this, Waypoint);

    var _this = _possibleConstructorReturn(this, (Waypoint.__proto__ || Object.getPrototypeOf(Waypoint)).call(this, props));

    _this.refElement = function (e) {
      return _this._ref = e;
    };
    return _this;
  }

  _createClass(Waypoint, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      (0, _ensureChildrenIsSingleDOMElement2.default)(this.props.children);

      if (this.props.scrollableParent) {
        // eslint-disable-line react/prop-types
        throw new Error('The `scrollableParent` prop has changed name to `scrollableAncestor`.');
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (!Waypoint.getWindow()) {
        return;
      }

      // this._ref may occasionally not be set at this time. To help ensure that
      // this works smoothly, we want to delay the initial execution until the
      // next tick.
      this.cancelInitialTimeout = (0, _onNextTick2.default)(function () {
        _this2._handleScroll = _this2._handleScroll.bind(_this2);
        _this2.scrollableAncestor = _this2._findScrollableAncestor();

        if (process.env.NODE_ENV !== 'production' && _this2.props.debug) {
          (0, _debugLog2.default)('scrollableAncestor', _this2.scrollableAncestor);
        }

        _this2.scrollEventListenerHandle = (0, _consolidatedEvents.addEventListener)(_this2.scrollableAncestor, 'scroll', _this2._handleScroll, { passive: true });

        _this2.resizeEventListenerHandle = (0, _consolidatedEvents.addEventListener)(window, 'resize', _this2._handleScroll, { passive: true });

        _this2._handleScroll(null);
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      (0, _ensureChildrenIsSingleDOMElement2.default)(nextProps.children);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (!Waypoint.getWindow()) {
        return;
      }

      if (!this.scrollableAncestor) {
        // The Waypoint has not yet initialized.
        return;
      }

      // The element may have moved.
      this._handleScroll(null);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (!Waypoint.getWindow()) {
        return;
      }

      if (this.scrollEventListenerHandle) {
        (0, _consolidatedEvents.removeEventListener)(this.scrollEventListenerHandle);
      }
      if (this.resizeEventListenerHandle) {
        (0, _consolidatedEvents.removeEventListener)(this.resizeEventListenerHandle);
      }

      if (this.cancelInitialTimeout) {
        this.cancelInitialTimeout();
      }
    }

    /**
     * Traverses up the DOM to find an ancestor container which has an overflow
     * style that allows for scrolling.
     *
     * @return {Object} the closest ancestor element with an overflow style that
     *   allows for scrolling. If none is found, the `window` object is returned
     *   as a fallback.
     */

  }, {
    key: '_findScrollableAncestor',
    value: function _findScrollableAncestor() {
      var _props = this.props,
          horizontal = _props.horizontal,
          scrollableAncestor = _props.scrollableAncestor;


      if (scrollableAncestor) {
        return (0, _resolveScrollableAncestorProp2.default)(scrollableAncestor);
      }

      var node = this._ref;

      while (node.parentNode) {
        node = node.parentNode;

        if (node === document.body) {
          // We've reached all the way to the root node.
          return window;
        }

        var style = window.getComputedStyle(node);
        var overflowDirec = horizontal ? style.getPropertyValue('overflow-x') : style.getPropertyValue('overflow-y');
        var overflow = overflowDirec || style.getPropertyValue('overflow');

        if (overflow === 'auto' || overflow === 'scroll') {
          return node;
        }
      }

      // A scrollable ancestor element was not found, which means that we need to
      // do stuff on window.
      return window;
    }

    /**
     * @param {Object} event the native scroll event coming from the scrollable
     *   ancestor, or resize event coming from the window. Will be undefined if
     *   called by a React lifecyle method
     */

  }, {
    key: '_handleScroll',
    value: function _handleScroll(event) {
      if (!this._ref) {
        // There's a chance we end up here after the component has been unmounted.
        return;
      }

      var bounds = this._getBounds();
      var currentPosition = (0, _getCurrentPosition2.default)(bounds);
      var previousPosition = this._previousPosition;

      if (process.env.NODE_ENV !== 'production' && this.props.debug) {
        (0, _debugLog2.default)('currentPosition', currentPosition);
        (0, _debugLog2.default)('previousPosition', previousPosition);
      }

      // Save previous position as early as possible to prevent cycles
      this._previousPosition = currentPosition;

      if (previousPosition === currentPosition) {
        // No change since last trigger
        return;
      }

      var callbackArg = {
        currentPosition: currentPosition,
        previousPosition: previousPosition,
        event: event,
        waypointTop: bounds.waypointTop,
        waypointBottom: bounds.waypointBottom,
        viewportTop: bounds.viewportTop,
        viewportBottom: bounds.viewportBottom
      };
      this.props.onPositionChange.call(this, callbackArg);

      if (currentPosition === _constants2.default.inside) {
        this.props.onEnter.call(this, callbackArg);
      } else if (previousPosition === _constants2.default.inside) {
        this.props.onLeave.call(this, callbackArg);
      }

      var isRapidScrollDown = previousPosition === _constants2.default.below && currentPosition === _constants2.default.above;
      var isRapidScrollUp = previousPosition === _constants2.default.above && currentPosition === _constants2.default.below;

      if (this.props.fireOnRapidScroll && (isRapidScrollDown || isRapidScrollUp)) {
        // If the scroll event isn't fired often enough to occur while the
        // waypoint was visible, we trigger both callbacks anyway.
        this.props.onEnter.call(this, {
          currentPosition: _constants2.default.inside,
          previousPosition: previousPosition,
          event: event,
          waypointTop: bounds.waypointTop,
          waypointBottom: bounds.waypointBottom,
          viewportTop: bounds.viewportTop,
          viewportBottom: bounds.viewportBottom
        });
        this.props.onLeave.call(this, {
          currentPosition: currentPosition,
          previousPosition: _constants2.default.inside,
          event: event,
          waypointTop: bounds.waypointTop,
          waypointBottom: bounds.waypointBottom,
          viewportTop: bounds.viewportTop,
          viewportBottom: bounds.viewportBottom
        });
      }
    }
  }, {
    key: '_getBounds',
    value: function _getBounds() {
      var horizontal = this.props.horizontal;

      var _ref$getBoundingClien = this._ref.getBoundingClientRect(),
          left = _ref$getBoundingClien.left,
          top = _ref$getBoundingClien.top,
          right = _ref$getBoundingClien.right,
          bottom = _ref$getBoundingClien.bottom;

      var waypointTop = horizontal ? left : top;
      var waypointBottom = horizontal ? right : bottom;

      var contextHeight = void 0;
      var contextScrollTop = void 0;
      if (this.scrollableAncestor === window) {
        contextHeight = horizontal ? window.innerWidth : window.innerHeight;
        contextScrollTop = 0;
      } else {
        contextHeight = horizontal ? this.scrollableAncestor.offsetWidth : this.scrollableAncestor.offsetHeight;
        contextScrollTop = horizontal ? this.scrollableAncestor.getBoundingClientRect().left : this.scrollableAncestor.getBoundingClientRect().top;
      }

      if (process.env.NODE_ENV !== 'production' && this.props.debug) {
        (0, _debugLog2.default)('waypoint top', waypointTop);
        (0, _debugLog2.default)('waypoint bottom', waypointBottom);
        (0, _debugLog2.default)('scrollableAncestor height', contextHeight);
        (0, _debugLog2.default)('scrollableAncestor scrollTop', contextScrollTop);
      }

      var _props2 = this.props,
          bottomOffset = _props2.bottomOffset,
          topOffset = _props2.topOffset;

      var topOffsetPx = (0, _computeOffsetPixels2.default)(topOffset, contextHeight);
      var bottomOffsetPx = (0, _computeOffsetPixels2.default)(bottomOffset, contextHeight);
      var contextBottom = contextScrollTop + contextHeight;

      return {
        waypointTop: waypointTop,
        waypointBottom: waypointBottom,
        viewportTop: contextScrollTop + topOffsetPx,
        viewportBottom: contextBottom - bottomOffsetPx
      };
    }

    /**
     * @return {Object}
     */

  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var children = this.props.children;


      if (!children) {
        // We need an element that we can locate in the DOM to determine where it is
        // rendered relative to the top of its context.
        return _react2.default.createElement('span', { ref: this.refElement, style: { fontSize: 0 } });
      }

      var ref = function ref(node) {
        _this3.refElement(node);
        if (children.ref) {
          children.ref(node);
        }
      };

      return _react2.default.cloneElement(children, { ref: ref });
    }
  }]);

  return Waypoint;
}(_react2.default.Component);

exports.default = Waypoint;


Waypoint.propTypes = {
  children: _propTypes2.default.element,
  debug: _propTypes2.default.bool,
  onEnter: _propTypes2.default.func,
  onLeave: _propTypes2.default.func,
  onPositionChange: _propTypes2.default.func,
  fireOnRapidScroll: _propTypes2.default.bool,
  scrollableAncestor: _propTypes2.default.any,
  horizontal: _propTypes2.default.bool,

  // `topOffset` can either be a number, in which case its a distance from the
  // top of the container in pixels, or a string value. Valid string values are
  // of the form "20px", which is parsed as pixels, or "20%", which is parsed
  // as a percentage of the height of the containing element.
  // For instance, if you pass "-20%", and the containing element is 100px tall,
  // then the waypoint will be triggered when it has been scrolled 20px beyond
  // the top of the containing element.
  topOffset: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),

  // `bottomOffset` is like `topOffset`, but for the bottom of the container.
  bottomOffset: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])
};

Waypoint.above = _constants2.default.above;
Waypoint.below = _constants2.default.below;
Waypoint.inside = _constants2.default.inside;
Waypoint.invisible = _constants2.default.invisible;
Waypoint.getWindow = function () {
  if (typeof window !== 'undefined') {
    return window;
  }
};
Waypoint.defaultProps = defaultProps;
Waypoint.displayName = 'Waypoint';
module.exports = exports['default'];