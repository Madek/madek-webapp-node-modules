'use strict';

exports.__esModule = true;
exports.ALL = exports.REMOTE = exports.NORMAL = undefined;

var _audioTrackList = require('./audio-track-list');

var _audioTrackList2 = _interopRequireDefault(_audioTrackList);

var _videoTrackList = require('./video-track-list');

var _videoTrackList2 = _interopRequireDefault(_videoTrackList);

var _textTrackList = require('./text-track-list');

var _textTrackList2 = _interopRequireDefault(_textTrackList);

var _htmlTrackElementList = require('./html-track-element-list');

var _htmlTrackElementList2 = _interopRequireDefault(_htmlTrackElementList);

var _textTrack = require('./text-track');

var _textTrack2 = _interopRequireDefault(_textTrack);

var _audioTrack = require('./audio-track');

var _audioTrack2 = _interopRequireDefault(_audioTrack);

var _videoTrack = require('./video-track');

var _videoTrack2 = _interopRequireDefault(_videoTrack);

var _htmlTrackElement = require('./html-track-element');

var _htmlTrackElement2 = _interopRequireDefault(_htmlTrackElement);

var _mergeOptions = require('../utils/merge-options');

var _mergeOptions2 = _interopRequireDefault(_mergeOptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * This file contains all track properties that are used in
 * player.js, tech.js, html5.js and possibly other techs in the future.
 */

var NORMAL = {
  audio: {
    ListClass: _audioTrackList2['default'],
    TrackClass: _audioTrack2['default'],
    capitalName: 'Audio'
  },
  video: {
    ListClass: _videoTrackList2['default'],
    TrackClass: _videoTrack2['default'],
    capitalName: 'Video'
  },
  text: {
    ListClass: _textTrackList2['default'],
    TrackClass: _textTrack2['default'],
    capitalName: 'Text'
  }
};

Object.keys(NORMAL).forEach(function (type) {
  NORMAL[type].getterName = type + 'Tracks';
  NORMAL[type].privateName = type + 'Tracks_';
});

var REMOTE = {
  remoteText: {
    ListClass: _textTrackList2['default'],
    TrackClass: _textTrack2['default'],
    capitalName: 'RemoteText',
    getterName: 'remoteTextTracks',
    privateName: 'remoteTextTracks_'
  },
  remoteTextEl: {
    ListClass: _htmlTrackElementList2['default'],
    TrackClass: _htmlTrackElement2['default'],
    capitalName: 'RemoteTextTrackEls',
    getterName: 'remoteTextTrackEls',
    privateName: 'remoteTextTrackEls_'
  }
};

var ALL = (0, _mergeOptions2['default'])(NORMAL, REMOTE);

REMOTE.names = Object.keys(REMOTE);
NORMAL.names = Object.keys(NORMAL);
ALL.names = [].concat(REMOTE.names).concat(NORMAL.names);

exports.NORMAL = NORMAL;
exports.REMOTE = REMOTE;
exports.ALL = ALL;
