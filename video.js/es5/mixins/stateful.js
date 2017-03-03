'use strict';

exports.__esModule = true;

var _evented = require('./evented');

var _obj = require('../utils/obj');

var Obj = _interopRequireWildcard(_obj);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/**
 * Contains methods that provide statefulness to an object which is passed
 * to {@link module:stateful}.
 *
 * @mixin StatefulMixin
 */
/**
 * @file mixins/stateful.js
 * @module stateful
 */
var StatefulMixin = {

  /**
   * A hash containing arbitrary keys and values representing the state of
   * the object.
   *
   * @type {Object}
   */
  state: {},

  /**
   * Set the state of an object by mutating its
   * {@link module:stateful~StatefulMixin.state|state} object in place.
   *
   * @fires   module:stateful~StatefulMixin#statechanged
   * @param   {Object|Function} stateUpdates
   *          A new set of properties to shallow-merge into the plugin state.
   *          Can be a plain object or a function returning a plain object.
   *
   * @returns {Object|undefined}
   *          An object containing changes that occurred. If no changes
   *          occurred, returns `undefined`.
   */
  setState: function setState(stateUpdates) {
    var _this = this;

    // Support providing the `stateUpdates` state as a function.
    if (typeof stateUpdates === 'function') {
      stateUpdates = stateUpdates();
    }

    var changes = void 0;

    Obj.each(stateUpdates, function (value, key) {

      // Record the change if the value is different from what's in the
      // current state.
      if (_this.state[key] !== value) {
        changes = changes || {};
        changes[key] = {
          from: _this.state[key],
          to: value
        };
      }

      _this.state[key] = value;
    });

    // Only trigger "statechange" if there were changes AND we have a trigger
    // function. This allows us to not require that the target object be an
    // evented object.
    if (changes && (0, _evented.isEvented)(this)) {

      /**
       * An event triggered on an object that is both
       * {@link module:stateful|stateful} and {@link module:evented|evented}
       * indicating that its state has changed.
       *
       * @event    module:stateful~StatefulMixin#statechanged
       * @type     {Object}
       * @property {Object} changes
       *           A hash containing the properties that were changed and
       *           the values they were changed `from` and `to`.
       */
      this.trigger({
        changes: changes,
        type: 'statechanged'
      });
    }

    return changes;
  }
};

/**
 * Applies {@link module:stateful~StatefulMixin|StatefulMixin} to a target
 * object.
 *
 * If the target object is {@link module:evented|evented} and has a
 * `handleStateChanged` method, that method will be automatically bound to the
 * `statechanged` event on itself.
 *
 * @param   {Object} target
 *          The object to be made stateful.
 *
 * @param   {Object} [defaultState]
 *          A default set of properties to populate the newly-stateful object's
 *          `state` property.
 *
 * @returns {Object}
 *          Returns the `target`.
 */
function stateful(target, defaultState) {
  Obj.assign(target, StatefulMixin);

  // This happens after the mixing-in because we need to replace the `state`
  // added in that step.
  target.state = Obj.assign({}, target.state, defaultState);

  // Auto-bind the `handleStateChanged` method of the target object if it exists.
  if (typeof target.handleStateChanged === 'function' && (0, _evented.isEvented)(target)) {
    target.on('statechanged', target.handleStateChanged);
  }

  return target;
}

exports['default'] = stateful;
