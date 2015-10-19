"use strict";

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (fun) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return fun.bind.apply(fun, [undefined, _Object$create(null)].concat(args));
};

module.exports = exports["default"];