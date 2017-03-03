'use strict';

exports.__esModule = true;

var _obj = require('./obj');

/**
 * Filter out single bad source objects or multiple source objects in an
 * array. Also flattens nested source object arrays into a 1 dimensional
 * array of source objects.
 *
 * @param {Tech~SourceObject|Tech~SourceObject[]} src
 *        The src object to filter
 *
 * @return {Tech~SourceObject[]}
 *         An array of sourceobjects containing only valid sources
 *
 * @private
 */
var filterSource = function filterSource(src) {
  // traverse array
  if (Array.isArray(src)) {
    (function () {
      var newsrc = [];

      src.forEach(function (srcobj) {
        srcobj = filterSource(srcobj);

        if (Array.isArray(srcobj)) {
          newsrc = newsrc.concat(srcobj);
        } else if ((0, _obj.isObject)(srcobj)) {
          newsrc.push(srcobj);
        }
      });

      src = newsrc;
    })();
  } else if (typeof src === 'string' && src.trim()) {
    // convert string into object
    src = [{ src: src }];
  } else if ((0, _obj.isObject)(src) && typeof src.src === 'string' && src.src && src.src.trim()) {
    // src is already valid
    src = [src];
  } else {
    // invalid source, turn it into an empty array
    src = [];
  }

  return src;
}; /**
    * @module filter-source
    */
exports['default'] = filterSource;
