'use strict';

exports.__esModule = true;
exports.allowedSetters = exports.allowedGetters = undefined;
exports.use = use;
exports.getMiddleware = getMiddleware;
exports.setSource = setSource;
exports.setTech = setTech;
exports.get = get;
exports.set = set;

var _obj = require('../utils/obj.js');

var middlewares = {};

function use(type, middleware) {
  middlewares[type] = middlewares[type] || [];
  middlewares[type].push(middleware);
}

function getMiddleware(type) {
  if (type) {
    return middlewares[type];
  }

  return middlewares;
}

function setSource(player, src, next) {
  player.setTimeout(function () {
    return setSourceHelper(src, middlewares[src.type], next, player);
  }, 1);
}

function setTech(middleware, tech) {
  middleware.forEach(function (mw) {
    return mw.setTech && mw.setTech(tech);
  });
}

function get(middleware, tech, method) {
  return middleware.reduceRight(middlewareIterator(method), tech[method]());
}

function set(middleware, tech, method, arg) {
  return tech[method](middleware.reduce(middlewareIterator(method), arg));
}

var allowedGetters = exports.allowedGetters = {
  buffered: 1,
  currentTime: 1,
  duration: 1,
  seekable: 1,
  played: 1
};

var allowedSetters = exports.allowedSetters = {
  setCurrentTime: 1
};

function middlewareIterator(method) {
  return function (value, mw) {
    if (mw[method]) {
      return mw[method](value);
    }

    return value;
  };
}

function setSourceHelper() {
  var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var middleware = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var next = arguments[2];
  var player = arguments[3];
  var acc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var lastRun = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var mwFactory = middleware[0],
      mwrest = middleware.slice(1);

  // if mwFactory is a string, then we're at a fork in the road

  if (typeof mwFactory === 'string') {
    setSourceHelper(src, middlewares[mwFactory], next, player, acc, lastRun);

    // if we have an mwFactory, call it with the player to get the mw,
    // then call the mw's setSource method
  } else if (mwFactory) {
    (function () {
      var mw = mwFactory(player);

      mw.setSource((0, _obj.assign)({}, src), function (err, _src) {

        // something happened, try the next middleware on the current level
        // make sure to use the old src
        if (err) {
          return setSourceHelper(src, mwrest, next, player, acc, lastRun);
        }

        // we've succeeded, now we need to go deeper
        acc.push(mw);

        // if it's the same time, continue does the current chain
        // otherwise, we want to go down the new chain
        setSourceHelper(_src, src.type === _src.type ? mwrest : middlewares[_src.type], next, player, acc, lastRun);
      });
    })();
  } else if (mwrest.length) {
    setSourceHelper(src, mwrest, next, player, acc, lastRun);
  } else if (lastRun) {
    next(src, acc);
  } else {
    setSourceHelper(src, middlewares['*'], next, player, acc, true);
  }
}
