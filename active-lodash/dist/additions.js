'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (f) {
  var present = function present(val) {
    return(
      // do what the coffeescript `?` operator compiles to
      typeof val !== 'undefined' && val !== null && (
      // AND (not "isEmpty" OR a primitive type)
      !f.isEmpty(val) || f.isNumber(val) || f.isBoolean(val) || f.isFunction(val))
    );
  };

  var presence = function presence(val) {
    if (present(val)) {
      return val;
    }
  };

  return {
    present: present,
    presence: presence
  };
};

module.exports = exports['default'];