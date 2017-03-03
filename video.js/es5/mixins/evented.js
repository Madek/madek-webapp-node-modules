'use strict';

exports.__esModule = true;
exports.isEvented = undefined;

var _dom = require('../utils/dom');

var Dom = _interopRequireWildcard(_dom);

var _events = require('../utils/events');

var Events = _interopRequireWildcard(_events);

var _fn = require('../utils/fn');

var Fn = _interopRequireWildcard(_fn);

var _obj = require('../utils/obj');

var Obj = _interopRequireWildcard(_obj);

var _eventTarget = require('../event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/**
 * Returns whether or not an object has had the evented mixin applied.
 *
 * @param  {Object} object
 *         An object to test.
 *
 * @return {boolean}
 *         Whether or not the object appears to be evented.
 */
var isEvented = function isEvented(object) {
  return object instanceof _eventTarget2['default'] || !!object.eventBusEl_ && ['on', 'one', 'off', 'trigger'].every(function (k) {
    return typeof object[k] === 'function';
  });
};

/**
 * Whether a value is a valid event type - non-empty string or array.
 *
 * @private
 * @param  {string|Array} type
 *         The type value to test.
 *
 * @return {boolean}
 *         Whether or not the type is a valid event type.
 */
/**
 * @file mixins/evented.js
 * @module evented
 */
var isValidEventType = function isValidEventType(type) {
  return (
    // The regex here verifies that the `type` contains at least one non-
    // whitespace character.
    typeof type === 'string' && /\S/.test(type) || Array.isArray(type) && !!type.length
  );
};

/**
 * Validates a value to determine if it is a valid event target. Throws if not.
 *
 * @private
 * @throws {Error}
 *         If the target does not appear to be a valid event target.
 *
 * @param  {Object} target
 *         The object to test.
 */
var validateTarget = function validateTarget(target) {
  if (!target.nodeName && !isEvented(target)) {
    throw new Error('Invalid target; must be a DOM node or evented object.');
  }
};

/**
 * Validates a value to determine if it is a valid event target. Throws if not.
 *
 * @private
 * @throws {Error}
 *         If the type does not appear to be a valid event type.
 *
 * @param  {string|Array} type
 *         The type to test.
 */
var validateEventType = function validateEventType(type) {
  if (!isValidEventType(type)) {
    throw new Error('Invalid event type; must be a non-empty string or array.');
  }
};

/**
 * Validates a value to determine if it is a valid listener. Throws if not.
 *
 * @private
 * @throws {Error}
 *         If the listener is not a function.
 *
 * @param  {Function} listener
 *         The listener to test.
 */
var validateListener = function validateListener(listener) {
  if (typeof listener !== 'function') {
    throw new Error('Invalid listener; must be a function.');
  }
};

/**
 * Takes an array of arguments given to `on()` or `one()`, validates them, and
 * normalizes them into an object.
 *
 * @private
 * @param  {Object} self
 *         The evented object on which `on()` or `one()` was called. This
 *         object will be bound as the `this` value for the listener.
 *
 * @param  {Array} args
 *         An array of arguments passed to `on()` or `one()`.
 *
 * @return {Object}
 *         An object containing useful values for `on()` or `one()` calls.
 */
var normalizeListenArgs = function normalizeListenArgs(self, args) {

  // If the number of arguments is less than 3, the target is always the
  // evented object itself.
  var isTargetingSelf = args.length < 3 || args[0] === self || args[0] === self.eventBusEl_;
  var target = void 0;
  var type = void 0;
  var listener = void 0;

  if (isTargetingSelf) {
    target = self.eventBusEl_;

    // Deal with cases where we got 3 arguments, but we are still listening to
    // the evented object itself.
    if (args.length >= 3) {
      args.shift();
    }

    type = args[0];
    listener = args[1];
  } else {
    target = args[0];
    type = args[1];
    listener = args[2];
  }

  validateTarget(target);
  validateEventType(type);
  validateListener(listener);

  listener = Fn.bind(self, listener);

  return { isTargetingSelf: isTargetingSelf, target: target, type: type, listener: listener };
};

/**
 * Adds the listener to the event type(s) on the target, normalizing for
 * the type of target.
 *
 * @private
 * @param  {Element|Object} target
 *         A DOM node or evented object.
 *
 * @param  {string} method
 *         The event binding method to use ("on" or "one").
 *
 * @param  {string|Array} type
 *         One or more event type(s).
 *
 * @param  {Function} listener
 *         A listener function.
 */
var listen = function listen(target, method, type, listener) {
  validateTarget(target);

  if (target.nodeName) {
    Events[method](target, type, listener);
  } else {
    target[method](type, listener);
  }
};

/**
 * Contains methods that provide event capabilites to an object which is passed
 * to {@link module:evented|evented}.
 *
 * @mixin EventedMixin
 */
var EventedMixin = {

  /**
   * Add a listener to an event (or events) on this object or another evented
   * object.
   *
   * @param  {string|Array|Element|Object} targetOrType
   *         If this is a string or array, it represents the event type(s)
   *         that will trigger the listener.
   *
   *         Another evented object can be passed here instead, which will
   *         cause the listener to listen for events on _that_ object.
   *
   *         In either case, the listener's `this` value will be bound to
   *         this object.
   *
   * @param  {string|Array|Function} typeOrListener
   *         If the first argument was a string or array, this should be the
   *         listener function. Otherwise, this is a string or array of event
   *         type(s).
   *
   * @param  {Function} [listener]
   *         If the first argument was another evented object, this will be
   *         the listener function.
   */
  on: function on() {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _normalizeListenArgs = normalizeListenArgs(this, args),
        isTargetingSelf = _normalizeListenArgs.isTargetingSelf,
        target = _normalizeListenArgs.target,
        type = _normalizeListenArgs.type,
        listener = _normalizeListenArgs.listener;

    listen(target, 'on', type, listener);

    // If this object is listening to another evented object.
    if (!isTargetingSelf) {
      (function () {

        // If this object is disposed, remove the listener.
        var removeListenerOnDispose = function removeListenerOnDispose() {
          return _this.off(target, type, listener);
        };

        // Use the same function ID as the listener so we can remove it later it
        // using the ID of the original listener.
        removeListenerOnDispose.guid = listener.guid;

        // Add a listener to the target's dispose event as well. This ensures
        // that if the target is disposed BEFORE this object, we remove the
        // removal listener that was just added. Otherwise, we create a memory leak.
        var removeRemoverOnTargetDispose = function removeRemoverOnTargetDispose() {
          return _this.off('dispose', removeListenerOnDispose);
        };

        // Use the same function ID as the listener so we can remove it later
        // it using the ID of the original listener.
        removeRemoverOnTargetDispose.guid = listener.guid;

        listen(_this, 'on', 'dispose', removeListenerOnDispose);
        listen(target, 'on', 'dispose', removeRemoverOnTargetDispose);
      })();
    }
  },


  /**
   * Add a listener to an event (or events) on this object or another evented
   * object. The listener will only be called once and then removed.
   *
   * @param  {string|Array|Element|Object} targetOrType
   *         If this is a string or array, it represents the event type(s)
   *         that will trigger the listener.
   *
   *         Another evented object can be passed here instead, which will
   *         cause the listener to listen for events on _that_ object.
   *
   *         In either case, the listener's `this` value will be bound to
   *         this object.
   *
   * @param  {string|Array|Function} typeOrListener
   *         If the first argument was a string or array, this should be the
   *         listener function. Otherwise, this is a string or array of event
   *         type(s).
   *
   * @param  {Function} [listener]
   *         If the first argument was another evented object, this will be
   *         the listener function.
   */
  one: function one() {
    var _this2 = this;

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var _normalizeListenArgs2 = normalizeListenArgs(this, args),
        isTargetingSelf = _normalizeListenArgs2.isTargetingSelf,
        target = _normalizeListenArgs2.target,
        type = _normalizeListenArgs2.type,
        listener = _normalizeListenArgs2.listener;

    // Targeting this evented object.


    if (isTargetingSelf) {
      listen(target, 'one', type, listener);

      // Targeting another evented object.
    } else {
      (function () {
        var wrapper = function wrapper() {
          for (var _len3 = arguments.length, largs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            largs[_key3] = arguments[_key3];
          }

          _this2.off(target, type, wrapper);
          listener.apply(null, largs);
        };

        // Use the same function ID as the listener so we can remove it later
        // it using the ID of the original listener.
        wrapper.guid = listener.guid;
        listen(target, 'one', type, wrapper);
      })();
    }
  },


  /**
   * Removes listener(s) from event(s) on an evented object.
   *
   * @param  {string|Array|Element|Object} [targetOrType]
   *         If this is a string or array, it represents the event type(s).
   *
   *         Another evented object can be passed here instead, in which case
   *         ALL 3 arguments are _required_.
   *
   * @param  {string|Array|Function} [typeOrListener]
   *         If the first argument was a string or array, this may be the
   *         listener function. Otherwise, this is a string or array of event
   *         type(s).
   *
   * @param  {Function} [listener]
   *         If the first argument was another evented object, this will be
   *         the listener function; otherwise, _all_ listeners bound to the
   *         event type(s) will be removed.
   */
  off: function off(targetOrType, typeOrListener, listener) {

    // Targeting this evented object.
    if (!targetOrType || isValidEventType(targetOrType)) {
      Events.off(this.eventBusEl_, targetOrType, typeOrListener);

      // Targeting another evented object.
    } else {
      var target = targetOrType;
      var type = typeOrListener;

      // Fail fast and in a meaningful way!
      validateTarget(target);
      validateEventType(type);
      validateListener(listener);

      // Ensure there's at least a guid, even if the function hasn't been used
      listener = Fn.bind(this, listener);

      // Remove the dispose listener on this evented object, which was given
      // the same guid as the event listener in on().
      this.off('dispose', listener);

      if (target.nodeName) {
        Events.off(target, type, listener);
        Events.off(target, 'dispose', listener);
      } else if (isEvented(target)) {
        target.off(type, listener);
        target.off('dispose', listener);
      }
    }
  },


  /**
   * Fire an event on this evented object, causing its listeners to be called.
   *
   * @param   {string|Object} event
   *          An event type or an object with a type property.
   *
   * @param   {Object} [hash]
   *          An additional object to pass along to listeners.
   *
   * @returns {boolean}
   *          Whether or not the default behavior was prevented.
   */
  trigger: function trigger(event, hash) {
    return Events.trigger(this.eventBusEl_, event, hash);
  }
};

/**
 * Applies {@link module:evented~EventedMixin|EventedMixin} to a target object.
 *
 * @param  {Object} target
 *         The object to which to add event methods.
 *
 * @param  {Object} [options={}]
 *         Options for customizing the mixin behavior.
 *
 * @param  {String} [options.eventBusKey]
 *         By default, adds a `eventBusEl_` DOM element to the target object,
 *         which is used as an event bus. If the target object already has a
 *         DOM element that should be used, pass its key here.
 *
 * @return {Object}
 *         The target object.
 */
function evented(target) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var eventBusKey = options.eventBusKey;

  // Set or create the eventBusEl_.

  if (eventBusKey) {
    if (!target[eventBusKey].nodeName) {
      throw new Error('The eventBusKey "' + eventBusKey + '" does not refer to an element.');
    }
    target.eventBusEl_ = target[eventBusKey];
  } else {
    target.eventBusEl_ = Dom.createEl('span', { className: 'vjs-event-bus' });
  }

  Obj.assign(target, EventedMixin);

  // When any evented object is disposed, it removes all its listeners.
  target.on('dispose', function () {
    return target.off();
  });

  return target;
}

exports['default'] = evented;
exports.isEvented = isEvented;
