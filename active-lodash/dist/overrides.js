'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _libCallWithNewObject = require('./lib/callWithNewObject');

var _libCallWithNewObject2 = _interopRequireDefault(_libCallWithNewObject);

exports['default'] = function (f) {
  var _merge = f.merge;
  var _extend = f.extend;
  var _defaults = f.defaults;
  var _defaultsDeep = f.defaultsDeep;

  // define here because it is aliased
  var extend = (0, _libCallWithNewObject2['default'])(_extend);

  return {
    assign: extend,
    extend: extend,
    defaults: (0, _libCallWithNewObject2['default'])(_defaults),
    defaultsDeep: (0, _libCallWithNewObject2['default'])(_defaultsDeep),
    merge: (0, _libCallWithNewObject2['default'])(_merge)
  };
};

module.exports = exports['default'];