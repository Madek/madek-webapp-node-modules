'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _lodashCustom = require('../lodash.custom');

var _lodashCustom2 = _interopRequireDefault(_lodashCustom);

var _overrides = require('./overrides');

var _overrides2 = _interopRequireDefault(_overrides);

var _additions = require('./additions');

var _additions2 = _interopRequireDefault(_additions);

exports['default'] = (function () {
  _lodashCustom2['default'].mixin((0, _overrides2['default'])(_lodashCustom2['default']));
  _lodashCustom2['default'].mixin((0, _additions2['default'])(_lodashCustom2['default']), { chain: false }); // returns value if chained
  return _lodashCustom2['default'];
})();

module.exports = exports['default'];