'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _evented = require('./mixins/evented');

var _evented2 = _interopRequireDefault(_evented);

var _stateful = require('./mixins/stateful');

var _stateful2 = _interopRequireDefault(_stateful);

var _events = require('./utils/events');

var Events = _interopRequireWildcard(_events);

var _fn = require('./utils/fn');

var Fn = _interopRequireWildcard(_fn);

var _player = require('./player');

var _player2 = _interopRequireDefault(_player);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * @file plugin.js
                                                                                                                                                           */


/**
 * The base plugin name.
 *
 * @private
 * @constant
 * @type {string}
 */
var BASE_PLUGIN_NAME = 'plugin';

/**
 * The key on which a player's active plugins cache is stored.
 *
 * @private
 * @constant
 * @type     {string}
 */
var PLUGIN_CACHE_KEY = 'activePlugins_';

/**
 * Stores registered plugins in a private space.
 *
 * @private
 * @type    {Object}
 */
var pluginStorage = {};

/**
 * Reports whether or not a plugin has been registered.
 *
 * @private
 * @param   {string} name
 *          The name of a plugin.
 *
 * @returns {boolean}
 *          Whether or not the plugin has been registered.
 */
var pluginExists = function pluginExists(name) {
  return pluginStorage.hasOwnProperty(name);
};

/**
 * Get a single registered plugin by name.
 *
 * @private
 * @param   {string} name
 *          The name of a plugin.
 *
 * @returns {Function|undefined}
 *          The plugin (or undefined).
 */
var getPlugin = function getPlugin(name) {
  return pluginExists(name) ? pluginStorage[name] : undefined;
};

/**
 * Marks a plugin as "active" on a player.
 *
 * Also, ensures that the player has an object for tracking active plugins.
 *
 * @private
 * @param   {Player} player
 *          A Video.js player instance.
 *
 * @param   {string} name
 *          The name of a plugin.
 */
var markPluginAsActive = function markPluginAsActive(player, name) {
  player[PLUGIN_CACHE_KEY] = player[PLUGIN_CACHE_KEY] || {};
  player[PLUGIN_CACHE_KEY][name] = true;
};

/**
 * Takes a basic plugin function and returns a wrapper function which marks
 * on the player that the plugin has been activated.
 *
 * @private
 * @param   {string} name
 *          The name of the plugin.
 *
 * @param   {Function} plugin
 *          The basic plugin.
 *
 * @returns {Function}
 *          A wrapper function for the given plugin.
 */
var createBasicPlugin = function createBasicPlugin(name, plugin) {
  var basicPluginWrapper = function basicPluginWrapper() {
    var instance = plugin.apply(this, arguments);

    markPluginAsActive(this, name);

    // We trigger the "pluginsetup" event on the player regardless, but we want
    // the hash to be consistent with the hash provided for advanced plugins.
    // The only potentially counter-intuitive thing here is the `instance` is the
    // value returned by the `plugin` function.
    this.trigger('pluginsetup', { name: name, plugin: plugin, instance: instance });
    return instance;
  };

  Object.keys(plugin).forEach(function (prop) {
    basicPluginWrapper[prop] = plugin[prop];
  });

  return basicPluginWrapper;
};

/**
 * Takes a plugin sub-class and returns a factory function for generating
 * instances of it.
 *
 * This factory function will replace itself with an instance of the requested
 * sub-class of Plugin.
 *
 * @private
 * @param   {string} name
 *          The name of the plugin.
 *
 * @param   {Plugin} PluginSubClass
 *          The advanced plugin.
 *
 * @returns {Function}
 */
var createPluginFactory = function createPluginFactory(name, PluginSubClass) {

  // Add a `name` property to the plugin prototype so that each plugin can
  // refer to itself by name.
  PluginSubClass.prototype.name = name;

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var instance = new (Function.prototype.bind.apply(PluginSubClass, [null].concat([this].concat(args))))();

    // The plugin is replaced by a function that returns the current instance.
    this[name] = function () {
      return instance;
    };

    return instance;
  };
};

/**
 * Parent class for all advanced plugins.
 *
 * @mixes   module:evented~EventedMixin
 * @mixes   module:stateful~StatefulMixin
 * @fires   Player#pluginsetup
 * @listens Player#dispose
 * @throws  {Error}
 *          If attempting to instantiate the base {@link Plugin} class
 *          directly instead of via a sub-class.
 */

var Plugin = function () {

  /**
   * Creates an instance of this class.
   *
   * Sub-classes should call `super` to ensure plugins are properly initialized.
   *
   * @param {Player} player
   *        A Video.js player instance.
   */
  function Plugin(player) {
    _classCallCheck(this, Plugin);

    this.player = player;

    if (this.constructor === Plugin) {
      throw new Error('Plugin must be sub-classed; not directly instantiated.');
    }

    // Make this object evented, but remove the added `trigger` method so we
    // use the prototype version instead.
    (0, _evented2['default'])(this);
    delete this.trigger;

    (0, _stateful2['default'])(this, this.constructor.defaultState);
    markPluginAsActive(player, this.name);

    // Auto-bind the dispose method so we can use it as a listener and unbind
    // it later easily.
    this.dispose = Fn.bind(this, this.dispose);

    // If the player is disposed, dispose the plugin.
    player.on('dispose', this.dispose);
    player.trigger('pluginsetup', this.getEventHash());
  }

  /**
   * Each event triggered by plugins includes a hash of additional data with
   * conventional properties.
   *
   * This returns that object or mutates an existing hash.
   *
   * @param   {Object} [hash={}]
   *          An object to be used as event an event hash.
   *
   * @returns {Plugin~PluginEventHash}
   *          An event hash object with provided properties mixed-in.
   */


  Plugin.prototype.getEventHash = function getEventHash() {
    var hash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    hash.name = this.name;
    hash.plugin = this.constructor;
    hash.instance = this;
    return hash;
  };

  /**
   * Triggers an event on the plugin object and overrides
   * {@link module:evented~EventedMixin.trigger|EventedMixin.trigger}.
   *
   * @param   {string|Object} event
   *          An event type or an object with a type property.
   *
   * @param   {Object} [hash={}]
   *          Additional data hash to merge with a
   *          {@link Plugin~PluginEventHash|PluginEventHash}.
   *
   * @returns {boolean}
   *          Whether or not default was prevented.
   */


  Plugin.prototype.trigger = function trigger(event) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return Events.trigger(this.eventBusEl_, event, this.getEventHash(hash));
  };

  /**
   * Handles "statechanged" events on the plugin. No-op by default, override by
   * subclassing.
   *
   * @abstract
   * @param    {Event} e
   *           An event object provided by a "statechanged" event.
   *
   * @param    {Object} e.changes
   *           An object describing changes that occurred with the "statechanged"
   *           event.
   */


  Plugin.prototype.handleStateChanged = function handleStateChanged(e) {};

  /**
   * Disposes a plugin.
   *
   * Subclasses can override this if they want, but for the sake of safety,
   * it's probably best to subscribe the "dispose" event.
   *
   * @fires Plugin#dispose
   */


  Plugin.prototype.dispose = function dispose() {
    var name = this.name,
        player = this.player;

    /**
     * Signals that a advanced plugin is about to be disposed.
     *
     * @event Plugin#dispose
     * @type  {EventTarget~Event}
     */

    this.trigger('dispose');
    this.off();
    player.off('dispose', this.dispose);

    // Eliminate any possible sources of leaking memory by clearing up
    // references between the player and the plugin instance and nulling out
    // the plugin's state and replacing methods with a function that throws.
    player[PLUGIN_CACHE_KEY][name] = false;
    this.player = this.state = null;

    // Finally, replace the plugin name on the player with a new factory
    // function, so that the plugin is ready to be set up again.
    player[name] = createPluginFactory(name, pluginStorage[name]);
  };

  /**
   * Determines if a plugin is a basic plugin (i.e. not a sub-class of `Plugin`).
   *
   * @param   {string|Function} plugin
   *          If a string, matches the name of a plugin. If a function, will be
   *          tested directly.
   *
   * @returns {boolean}
   *          Whether or not a plugin is a basic plugin.
   */


  Plugin.isBasic = function isBasic(plugin) {
    var p = typeof plugin === 'string' ? getPlugin(plugin) : plugin;

    return typeof p === 'function' && !Plugin.prototype.isPrototypeOf(p.prototype);
  };

  /**
   * Register a Video.js plugin.
   *
   * @param   {string} name
   *          The name of the plugin to be registered. Must be a string and
   *          must not match an existing plugin or a method on the `Player`
   *          prototype.
   *
   * @param   {Function} plugin
   *          A sub-class of `Plugin` or a function for basic plugins.
   *
   * @returns {Function}
   *          For advanced plugins, a factory function for that plugin. For
   *          basic plugins, a wrapper function that initializes the plugin.
   */


  Plugin.registerPlugin = function registerPlugin(name, plugin) {
    if (typeof name !== 'string') {
      throw new Error('Illegal plugin name, "' + name + '", must be a string, was ' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)) + '.');
    }

    if (pluginExists(name) || _player2['default'].prototype.hasOwnProperty(name)) {
      throw new Error('Illegal plugin name, "' + name + '", already exists.');
    }

    if (typeof plugin !== 'function') {
      throw new Error('Illegal plugin for "' + name + '", must be a function, was ' + (typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) + '.');
    }

    pluginStorage[name] = plugin;

    // Add a player prototype method for all sub-classed plugins (but not for
    // the base Plugin class).
    if (name !== BASE_PLUGIN_NAME) {
      if (Plugin.isBasic(plugin)) {
        _player2['default'].prototype[name] = createBasicPlugin(name, plugin);
      } else {
        _player2['default'].prototype[name] = createPluginFactory(name, plugin);
      }
    }

    return plugin;
  };

  /**
   * De-register a Video.js plugin.
   *
   * @param {string} name
   *        The name of the plugin to be deregistered.
   */


  Plugin.deregisterPlugin = function deregisterPlugin(name) {
    if (name === BASE_PLUGIN_NAME) {
      throw new Error('Cannot de-register base plugin.');
    }
    if (pluginExists(name)) {
      delete pluginStorage[name];
      delete _player2['default'].prototype[name];
    }
  };

  /**
   * Gets an object containing multiple Video.js plugins.
   *
   * @param   {Array} [names]
   *          If provided, should be an array of plugin names. Defaults to _all_
   *          plugin names.
   *
   * @returns {Object|undefined}
   *          An object containing plugin(s) associated with their name(s) or
   *          `undefined` if no matching plugins exist).
   */


  Plugin.getPlugins = function getPlugins() {
    var names = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Object.keys(pluginStorage);

    var result = void 0;

    names.forEach(function (name) {
      var plugin = getPlugin(name);

      if (plugin) {
        result = result || {};
        result[name] = plugin;
      }
    });

    return result;
  };

  /**
   * Gets a plugin's version, if available
   *
   * @param   {string} name
   *          The name of a plugin.
   *
   * @returns {string}
   *          The plugin's version or an empty string.
   */


  Plugin.getPluginVersion = function getPluginVersion(name) {
    var plugin = getPlugin(name);

    return plugin && plugin.VERSION || '';
  };

  return Plugin;
}();

/**
 * Gets a plugin by name if it exists.
 *
 * @static
 * @method   getPlugin
 * @memberOf Plugin
 * @param    {string} name
 *           The name of a plugin.
 *
 * @returns  {Function|undefined}
 *           The plugin (or `undefined`).
 */


Plugin.getPlugin = getPlugin;

/**
 * The name of the base plugin class as it is registered.
 *
 * @type {string}
 */
Plugin.BASE_PLUGIN_NAME = BASE_PLUGIN_NAME;

Plugin.registerPlugin(BASE_PLUGIN_NAME, Plugin);

/**
 * Documented in player.js
 *
 * @ignore
 */
_player2['default'].prototype.usingPlugin = function (name) {
  return !!this[PLUGIN_CACHE_KEY] && this[PLUGIN_CACHE_KEY][name] === true;
};

/**
 * Documented in player.js
 *
 * @ignore
 */
_player2['default'].prototype.hasPlugin = function (name) {
  return !!pluginExists(name);
};

exports['default'] = Plugin;

/**
 * Signals that a plugin has just been set up on a player.
 *
 * @event    Player#pluginsetup
 * @type     {Plugin~PluginEventHash}
 */

/**
 * @typedef  {Object} Plugin~PluginEventHash
 *
 * @property {string} instance
 *           For basic plugins, the return value of the plugin function. For
 *           advanced plugins, the plugin instance on which the event is fired.
 *
 * @property {string} name
 *           The name of the plugin.
 *
 * @property {string} plugin
 *           For basic plugins, the plugin function. For advanced plugins, the
 *           plugin class/constructor.
 */
