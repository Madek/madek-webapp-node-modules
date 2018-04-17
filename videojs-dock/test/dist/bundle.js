(function (QUnit,sinon,videojs) {
'use strict';

QUnit = 'default' in QUnit ? QUnit['default'] : QUnit;
sinon = 'default' in sinon ? sinon['default'] : sinon;
videojs = 'default' in videojs ? videojs['default'] : videojs;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var empty = {};


var empty$1 = (Object.freeze || Object)({
	'default': empty
});

var minDoc = ( empty$1 && empty ) || empty$1;

var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
    typeof window !== 'undefined' ? window : {};


var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

var document_1 = doccy;

var guid = 1;
var newGuid = function newGuid() {
  return guid++;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var dom = videojs.dom || videojs;
var registerPlugin = videojs.registerPlugin || videojs.plugin;
var Component = videojs.getComponent('Component');

/**
 * Title Component
 */
var Title = function (_Component) {
  inherits(Title, _Component);

  function Title(player, options) {
    classCallCheck(this, Title);

    var _this = possibleConstructorReturn(this, _Component.call(this, player, options));

    var tech = player.$('.vjs-tech');

    tech.setAttribute('aria-labelledby', _this.title.id);
    tech.setAttribute('aria-describedby', _this.description.id);
    return _this;
  }

  Title.prototype.createEl = function createEl() {
    var title = dom.createEl('div', {
      className: 'vjs-dock-title',
      title: this.options_.title,
      innerHTML: this.options_.title
    }, {
      id: 'vjs-dock-title-' + newGuid()
    });
    var desc = dom.createEl('div', {
      className: 'vjs-dock-description',
      title: this.options_.description,
      innerHTML: this.options_.description
    }, {
      id: 'vjs-dock-description-' + newGuid()
    });
    var el = _Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-dock-text'
    });

    this.title = title;
    this.description = desc;

    el.appendChild(title);
    el.appendChild(desc);
    return el;
  };

  Title.prototype.update = function update(title, description) {
    this.title.innerHTML = '';
    this.description.innerHTML = '';
    this.title.appendChild(document_1.createTextNode(title));
    this.description.appendChild(document_1.createTextNode(description));
  };

  return Title;
}(Component);

/**
 * Shelf Component
 */
var Shelf = function (_Component2) {
  inherits(Shelf, _Component2);

  function Shelf() {
    classCallCheck(this, Shelf);
    return possibleConstructorReturn(this, _Component2.apply(this, arguments));
  }

  Shelf.prototype.createEl = function createEl() {
    return _Component2.prototype.createEl.call(this, 'div', {
      className: 'vjs-dock-shelf'
    });
  };

  return Shelf;
}(Component);

videojs.registerComponent('Title', Title);
videojs.registerComponent('Shelf', Shelf);

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function dock
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
var dock = function dock(options) {
  var opts = options || {};
  var settings = {
    title: {
      title: opts.title || '',
      description: opts.description || ''
    }
  };

  var title = this.title;
  var shelf = this.shelf;

  this.addClass('vjs-dock');

  var bpbIndex = this.children().indexOf(this.getChild('bigPlayButton'));
  var index = bpbIndex > 0 ? bpbIndex - 1 : null;

  // add shelf first so `title` is added before it if available
  // because shelf will now be at index
  if (!shelf) {
    shelf = this.shelf = this.addChild('shelf', settings, index);
  }

  if (!title) {
    title = this.title = this.addChild('title', settings.title, index);
  } else {
    title.update(settings.title.title, settings.title.description);
  }

  this.one(title, 'dispose', function () {
    this.title = null;
  });

  this.one(shelf, 'dispose', function () {
    this.shelf = null;
  });
};

// Register the plugin with video.js.
registerPlugin('dock', dock);

var Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function (assert) {
  assert.strictEqual(_typeof(Array.isArray), 'function', 'es5 exists');
  assert.strictEqual(typeof sinon === 'undefined' ? 'undefined' : _typeof(sinon), 'object', 'sinon exists');
  assert.strictEqual(typeof videojs === 'undefined' ? 'undefined' : _typeof(videojs), 'function', 'videojs exists');
  assert.strictEqual(typeof dock === 'undefined' ? 'undefined' : _typeof(dock), 'function', 'plugin is a function');
});

QUnit.module('videojs-dock', {
  beforeEach: function beforeEach() {
    this.fixture = document_1.getElementById('qunit-fixture');
    this.video = document_1.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5.
    this.clock = sinon.useFakeTimers();
  },
  afterEach: function afterEach() {

    // The clock _must_ be restored before disposing the player; otherwise,
    // certain timeout listeners that happen inside video.js may throw errors.
    this.clock.restore();
    this.player.dispose();
  }
});

QUnit.test('registers itself with video.js', function (assert) {
  assert.expect(2);

  assert.strictEqual(_typeof(Player.prototype.dock), 'function', 'videojs-dock plugin was registered');

  this.player.dock();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(this.player.hasClass('vjs-dock'), 'the plugin adds a class to the player');
});

}(QUnit,sinon,videojs));
