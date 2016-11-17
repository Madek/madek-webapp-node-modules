'use strict';

exports.__esModule = true;

var _trackEnums = require('./track-enums');

var _track = require('./track');

var _track2 = _interopRequireDefault(_track);

var _mergeOptions = require('../utils/merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

var _browser = require('../utils/browser.js');

var browser = _interopRequireWildcard(_browser);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A single video text track as defined in:
 * @link https://html.spec.whatwg.org/multipage/embedded-content.html#videotrack
 *
 * interface VideoTrack {
 *   readonly attribute DOMString id;
 *   readonly attribute DOMString kind;
 *   readonly attribute DOMString label;
 *   readonly attribute DOMString language;
 *   attribute boolean selected;
 * };
 *
 * @param {Object=} options Object of option names and values
 * @class VideoTrack
 */
var VideoTrack = function (_Track) {
  _inherits(VideoTrack, _Track);

  function VideoTrack() {
    var _this, _ret;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, VideoTrack);

    var settings = (0, _mergeOptions2['default'])(options, {
      kind: _trackEnums.VideoTrackKind[options.kind] || ''
    });

    // on IE8 this will be a document element
    // for every other browser this will be a normal object
    var track = (_this = _possibleConstructorReturn(this, _Track.call(this, settings)), _this);
    var selected = false;

    if (browser.IS_IE8) {
      for (var prop in VideoTrack.prototype) {
        if (prop !== 'constructor') {
          track[prop] = VideoTrack.prototype[prop];
        }
      }
    }

    Object.defineProperty(track, 'selected', {
      get: function get() {
        return selected;
      },
      set: function set(newSelected) {
        // an invalid or unchanged value
        if (typeof newSelected !== 'boolean' || newSelected === selected) {
          return;
        }
        selected = newSelected;
        this.trigger('selectedchange');
      }
    });

    // if the user sets this track to selected then
    // set selected to that true value otherwise
    // we keep it false
    if (settings.selected) {
      track.selected = settings.selected;
    }

    return _ret = track, _possibleConstructorReturn(_this, _ret);
  }

  return VideoTrack;
}(_track2['default']);

exports['default'] = VideoTrack;
