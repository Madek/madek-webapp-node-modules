/*global Rusha hex_sha1 jsSHA sjcl forge CryptoJS*/

/*any_sha1 Copyright (c) 2014 Stuart P. Bentley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function(){

"use strict";

var crypto, rusha;

function charCodes(s) {
  var l = s.length;
  var a = new Array(l);
  for (var i = 0; i < l; ++i) {
    a[i] = s.charCodeAt(i);
  }
  return a;
}

function hexBytes(s) {
  var l = s.length / 2;
  var a = new Array(l);
  for (var i = 0; i < l; ++i) {
    a[i] = parseInt(s.slice(i*2, (i*2)+2), 16);
  }
  return a;
}

function from(opts) {
  if (typeof module != "undefined") {
    crypto = crypto || require('crypto');
    return opts.node;
  } else if (typeof(Rusha) != "undefined") {
    rusha = rusha || new Rusha();
    return opts.rusha;
  } else if (typeof(forge) != "undefined") {
    return opts.forge;
  } else if (typeof(sjcl) != "undefined" && sjcl.hash.sha1) {
    return opts.sjcl;
  } else if (typeof(jsSHA) != "undefined") {
    return opts.jsSHA;
  } else if (typeof(hex_sha1) != "undefined") {
    return opts.paj;
  } else if (typeof(CryptoJS) != "undefined") {
    return opts.cryptoJS;
  } else if (window.polycrypt) {
    return opts.polycrypt;
  } else return null;
}

var any_sha1 = { utf8: {
  bytes: {
    node: function sha1Node(content) {
      crypto = crypto || require('crypto');
      return Array.apply([],
        crypto.createHash('sha1').update(content, 'utf8').digest());
    },
    rusha: function sha1Rusha(content) {
      rusha = rusha || new Rusha();
      return Array.apply([], new Uint8Array(
        rusha.rawDigest(unescape(encodeURIComponent(content))).buffer));
    },
    forge: function sha1Forge(content) {
      return charCodes(forge.md.sha1.create()
        .update(unescape(encodeURIComponent(content))).digest().bytes());
    },
    sjcl: function sha1Sjcl(content) {
      var result = sjcl.hash.sha1.hash(unescape(encodeURIComponent(content)));
      var a = new Array(20);
      for (var i = 0; i < 5; ++i) {
        a[i*4] = result[i] & 0xFF;
        a[i*4+1] = result[i] >> 8 & 0xFF;
        a[i*4+2] = result[i] >> 16 & 0xFF;
        a[i*4+3] = result[i] >> 24;
      }
      return a;
    },
    jsSHA: function sha1JsSHA(content) {
      return hexBytes(new jsSHA(unescape(encodeURIComponent(content)),'TEXT')
        .getHash('SHA-1','HEX'));
    },
    paj: function sha1Paj(content) {
      return hexBytes(hex_sha1(content));
    },
    cryptoJS: function sha1CryptoJS(content) {
        return hexBytes(CryptoJS.SHA1(unescape(encodeURIComponent(content))));
    },
    polycrypt: function sha1Polycrypt(content) {
      return hexBytes(window.polycrypt.digest('SHA-1',
        unescape(encodeURIComponent(content))));
    }
  }},

  define: function define(opts, obj, key, chooser) {
    obj = obj || window;
    key = key || 'sha1';
    chooser = chooser || from;
    if (typeof(Rusha) != "undefined")
      rusha = new Rusha();

    if (obj[key]) {
      return obj[key];
    }

    var f = chooser(opts);
    if (f) {
      return obj[key] = f;
    } else {
      return obj[key] = function sha1LateBinding(content) {
        var f = chooser(opts);
        obj[key] = f;
        return f(content);
      };
    }
  },

  from: from, charCodes: charCodes, hexBytes: hexBytes
};

if(typeof module != "undefined") {
  module.exports = any_sha1;
  crypto = require('crypto');
} else {
  window.any_sha1 = any_sha1;
}
})();
