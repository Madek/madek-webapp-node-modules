"use strict";

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (func) {
  return function () {
    return func.bind(undefined, _Object$create(null)).apply(undefined, arguments);
  };
};

module.exports = exports["default"];