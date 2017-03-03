'use strict';

exports.__esModule = true;
exports.getData = getData;
exports.hasData = hasData;
exports.removeData = removeData;

var _guid = require('./guid.js');

var Guid = _interopRequireWildcard(_guid);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/**
 * Element Data Store.
 *
 * Allows for binding data to an element without putting it directly on the
 * element. Ex. Event listeners are stored here.
 * (also from jsninja.com, slightly modified and updated for closure compiler)
 *
 * @type {Object}
 * @private
 */
var elData = {};

/*
 * Unique attribute name to store an element's guid in
 *
 * @type {String}
 * @constant
 * @private
 */
/**
 * @file dom-data.js
 * @module dom-data
 */
var elIdAttr = 'vdata' + new Date().getTime();

/**
 * Returns the cache object where data for an element is stored
 *
 * @param {Element} el
 *        Element to store data for.
 *
 * @return {Object}
 *         The cache object for that el that was passed in.
 */
function getData(el) {
  var id = el[elIdAttr];

  if (!id) {
    id = el[elIdAttr] = Guid.newGUID();
  }

  if (!elData[id]) {
    elData[id] = {};
  }

  return elData[id];
}

/**
 * Returns whether or not an element has cached data
 *
 * @param {Element} el
 *        Check if this element has cached data.
 *
 * @return {boolean}
 *         - True if the DOM element has cached data.
 *         - False otherwise.
 */
function hasData(el) {
  var id = el[elIdAttr];

  if (!id) {
    return false;
  }

  return !!Object.getOwnPropertyNames(elData[id]).length;
}

/**
 * Delete data for the element from the cache and the guid attr from getElementById
 *
 * @param {Element} el
 *        Remove cached data for this element.
 */
function removeData(el) {
  var id = el[elIdAttr];

  if (!id) {
    return;
  }

  // Remove all stored data
  delete elData[id];

  // Remove the elIdAttr property from the DOM node
  try {
    delete el[elIdAttr];
  } catch (e) {
    if (el.removeAttribute) {
      el.removeAttribute(elIdAttr);
    } else {
      // IE doesn't appear to support removeAttribute on the document element
      el[elIdAttr] = null;
    }
  }
}
