'use strict';

exports.__esModule = true;

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/******************************************************************************
	Text Tokens
	Tokens composed of strings
******************************************************************************/

/**
	Abstract class used for manufacturing text tokens.
	Pass in the value this token represents

	@class TextToken
	@abstract
*/

var TextToken = function () {
	/**
 	@method constructor
 	@param {String} value The string of characters representing this particular Token
 */

	function TextToken(value) {
		_classCallCheck(this, TextToken);

		this.v = value;
	}

	/**
 	String representing the type for this token
 	@property type
 	@default 'TOKEN'
 */

	TextToken.prototype.toString = function toString() {
		return this.v + '';
	};

	return TextToken;
}();

/**
	A valid domain token
	@class DOMAIN
	@extends TextToken
*/


var DOMAIN = function (_TextToken) {
	_inherits(DOMAIN, _TextToken);

	function DOMAIN() {
		_classCallCheck(this, DOMAIN);

		return _possibleConstructorReturn(this, _TextToken.apply(this, arguments));
	}

	return DOMAIN;
}(TextToken);

/**
	@class AT
	@extends TextToken
*/


var AT = function (_TextToken2) {
	_inherits(AT, _TextToken2);

	function AT() {
		_classCallCheck(this, AT);

		return _possibleConstructorReturn(this, _TextToken2.call(this, '@'));
	}

	return AT;
}(TextToken);

/**
	Represents a single colon `:` character

	@class COLON
	@extends TextToken
*/


var COLON = function (_TextToken3) {
	_inherits(COLON, _TextToken3);

	function COLON() {
		_classCallCheck(this, COLON);

		return _possibleConstructorReturn(this, _TextToken3.call(this, ':'));
	}

	return COLON;
}(TextToken);

/**
	@class DOT
	@extends TextToken
*/


var DOT = function (_TextToken4) {
	_inherits(DOT, _TextToken4);

	function DOT() {
		_classCallCheck(this, DOT);

		return _possibleConstructorReturn(this, _TextToken4.call(this, '.'));
	}

	return DOT;
}(TextToken);

/**
	A character class that can surround the URL, but which the URL cannot begin
	or end with. Does not include certain English punctuation like parentheses.

	@class PUNCTUATION
	@extends TextToken
*/


var PUNCTUATION = function (_TextToken5) {
	_inherits(PUNCTUATION, _TextToken5);

	function PUNCTUATION() {
		_classCallCheck(this, PUNCTUATION);

		return _possibleConstructorReturn(this, _TextToken5.apply(this, arguments));
	}

	return PUNCTUATION;
}(TextToken);

/**
	The word localhost (by itself)
	@class LOCALHOST
	@extends TextToken
*/


var LOCALHOST = function (_TextToken6) {
	_inherits(LOCALHOST, _TextToken6);

	function LOCALHOST() {
		_classCallCheck(this, LOCALHOST);

		return _possibleConstructorReturn(this, _TextToken6.apply(this, arguments));
	}

	return LOCALHOST;
}(TextToken);

/**
	Newline token
	@class TNL
	@extends TextToken
*/


var TNL = function (_TextToken7) {
	_inherits(TNL, _TextToken7);

	function TNL() {
		_classCallCheck(this, TNL);

		return _possibleConstructorReturn(this, _TextToken7.call(this, '\n'));
	}

	return TNL;
}(TextToken);

/**
	@class NUM
	@extends TextToken
*/


var NUM = function (_TextToken8) {
	_inherits(NUM, _TextToken8);

	function NUM() {
		_classCallCheck(this, NUM);

		return _possibleConstructorReturn(this, _TextToken8.apply(this, arguments));
	}

	return NUM;
}(TextToken);

/**
	@class PLUS
	@extends TextToken
*/


var PLUS = function (_TextToken9) {
	_inherits(PLUS, _TextToken9);

	function PLUS() {
		_classCallCheck(this, PLUS);

		return _possibleConstructorReturn(this, _TextToken9.call(this, '+'));
	}

	return PLUS;
}(TextToken);

/**
	@class POUND
	@extends TextToken
*/


var POUND = function (_TextToken10) {
	_inherits(POUND, _TextToken10);

	function POUND() {
		_classCallCheck(this, POUND);

		return _possibleConstructorReturn(this, _TextToken10.call(this, '#'));
	}

	return POUND;
}(TextToken);

/**
	Represents a web URL protocol. Supported types include

	* `http:`
	* `https:`
	* `ftp:`
	* `ftps:`
	* There's Another super weird one

	@class PROTOCOL
	@extends TextToken
*/


var PROTOCOL = function (_TextToken11) {
	_inherits(PROTOCOL, _TextToken11);

	function PROTOCOL() {
		_classCallCheck(this, PROTOCOL);

		return _possibleConstructorReturn(this, _TextToken11.apply(this, arguments));
	}

	return PROTOCOL;
}(TextToken);

/**
	@class QUERY
	@extends TextToken
*/


var QUERY = function (_TextToken12) {
	_inherits(QUERY, _TextToken12);

	function QUERY() {
		_classCallCheck(this, QUERY);

		return _possibleConstructorReturn(this, _TextToken12.call(this, '?'));
	}

	return QUERY;
}(TextToken);

/**
	@class SLASH
	@extends TextToken
*/


var SLASH = function (_TextToken13) {
	_inherits(SLASH, _TextToken13);

	function SLASH() {
		_classCallCheck(this, SLASH);

		return _possibleConstructorReturn(this, _TextToken13.call(this, '/'));
	}

	return SLASH;
}(TextToken);

/**
	One ore more non-whitespace symbol.
	@class SYM
	@extends TextToken
*/


var SYM = function (_TextToken14) {
	_inherits(SYM, _TextToken14);

	function SYM() {
		_classCallCheck(this, SYM);

		return _possibleConstructorReturn(this, _TextToken14.apply(this, arguments));
	}

	return SYM;
}(TextToken);

/**
	@class TLD
	@extends TextToken
*/


var TLD = function (_TextToken15) {
	_inherits(TLD, _TextToken15);

	function TLD() {
		_classCallCheck(this, TLD);

		return _possibleConstructorReturn(this, _TextToken15.apply(this, arguments));
	}

	return TLD;
}(TextToken);

/**
	Represents a string of consecutive whitespace characters

	@class WS
	@extends TextToken
*/


var WS = function (_TextToken16) {
	_inherits(WS, _TextToken16);

	function WS() {
		_classCallCheck(this, WS);

		return _possibleConstructorReturn(this, _TextToken16.apply(this, arguments));
	}

	return WS;
}(TextToken);

/**
	Opening/closing bracket classes
*/

var OPENBRACE = function (_TextToken17) {
	_inherits(OPENBRACE, _TextToken17);

	function OPENBRACE() {
		_classCallCheck(this, OPENBRACE);

		return _possibleConstructorReturn(this, _TextToken17.call(this, '{'));
	}

	return OPENBRACE;
}(TextToken);

var OPENBRACKET = function (_TextToken18) {
	_inherits(OPENBRACKET, _TextToken18);

	function OPENBRACKET() {
		_classCallCheck(this, OPENBRACKET);

		return _possibleConstructorReturn(this, _TextToken18.call(this, '['));
	}

	return OPENBRACKET;
}(TextToken);

var OPENPAREN = function (_TextToken19) {
	_inherits(OPENPAREN, _TextToken19);

	function OPENPAREN() {
		_classCallCheck(this, OPENPAREN);

		return _possibleConstructorReturn(this, _TextToken19.call(this, '('));
	}

	return OPENPAREN;
}(TextToken);

var CLOSEBRACE = function (_TextToken20) {
	_inherits(CLOSEBRACE, _TextToken20);

	function CLOSEBRACE() {
		_classCallCheck(this, CLOSEBRACE);

		return _possibleConstructorReturn(this, _TextToken20.call(this, '}'));
	}

	return CLOSEBRACE;
}(TextToken);

var CLOSEBRACKET = function (_TextToken21) {
	_inherits(CLOSEBRACKET, _TextToken21);

	function CLOSEBRACKET() {
		_classCallCheck(this, CLOSEBRACKET);

		return _possibleConstructorReturn(this, _TextToken21.call(this, ']'));
	}

	return CLOSEBRACKET;
}(TextToken);

var CLOSEPAREN = function (_TextToken22) {
	_inherits(CLOSEPAREN, _TextToken22);

	function CLOSEPAREN() {
		_classCallCheck(this, CLOSEPAREN);

		return _possibleConstructorReturn(this, _TextToken22.call(this, ')'));
	}

	return CLOSEPAREN;
}(TextToken);

var text = {
	Base: TextToken,
	DOMAIN: DOMAIN,
	AT: AT,
	COLON: COLON,
	DOT: DOT,
	PUNCTUATION: PUNCTUATION,
	LOCALHOST: LOCALHOST,
	NL: TNL,
	NUM: NUM,
	PLUS: PLUS,
	POUND: POUND,
	QUERY: QUERY,
	PROTOCOL: PROTOCOL,
	SLASH: SLASH,
	SYM: SYM,
	TLD: TLD,
	WS: WS,
	OPENBRACE: OPENBRACE,
	OPENBRACKET: OPENBRACKET,
	OPENPAREN: OPENPAREN,
	CLOSEBRACE: CLOSEBRACE,
	CLOSEBRACKET: CLOSEBRACKET,
	CLOSEPAREN: CLOSEPAREN
};

/******************************************************************************
	Multi-Tokens
	Tokens composed of arrays of TextTokens
******************************************************************************/

// Is the given token a valid domain token?
// Should nums be included here?
function isDomainToken(token) {
	return token instanceof DOMAIN || token instanceof TLD;
}

/**
	Abstract class used for manufacturing tokens of text tokens. That is rather
	than the value for a token being a small string of text, it's value an array
	of text tokens.

	Used for grouping together URLs, emails, hashtags, and other potential
	creations.

	@class MultiToken
	@abstract
*/

var MultiToken = function () {
	/**
 	@method constructor
 	@param {Array} value The array of `TextToken`s representing this
 	particular MultiToken
 */

	function MultiToken(value) {
		_classCallCheck(this, MultiToken);

		this.v = value;

		/**
  	String representing the type for this token
  	@property type
  	@default 'TOKEN'
  */
		this.type = 'token';

		/**
  	Is this multitoken a link?
  	@property isLink
  	@default false
  */
		this.isLink = false;
	}

	/**
 	Return the string this token represents.
 	@method toString
 	@return {String}
 */


	MultiToken.prototype.toString = function toString() {
		var result = [];
		for (var i = 0; i < this.v.length; i++) {
			result.push(this.v[i].toString());
		}
		return result.join('');
	};

	/**
 	What should the value for this token be in the `href` HTML attribute?
 	Returns the `.toString` value by default.
 		@method toHref
 	@return {String}
 */


	MultiToken.prototype.toHref = function toHref() {
		return this.toString();
	};

	/**
 	Returns a hash of relevant values for this token, which includes keys
 	* type - Kind of token ('url', 'email', etc.)
 	* value - Original text
 	* href - The value that should be added to the anchor tag's href
 		attribute
 		@method toObject
 	@param {String} [protocol] `'http'` by default
 	@return {Object}
 */


	MultiToken.prototype.toObject = function toObject() {
		var protocol = arguments.length <= 0 || arguments[0] === undefined ? 'http' : arguments[0];

		return {
			type: this.type,
			value: this.toString(),
			href: this.toHref(protocol)
		};
	};

	return MultiToken;
}();

/**
	Represents a list of tokens making up a valid email address
	@class EMAIL
	@extends MultiToken
*/


var EMAIL = function (_MultiToken) {
	_inherits(EMAIL, _MultiToken);

	function EMAIL(value) {
		_classCallCheck(this, EMAIL);

		var _this23 = _possibleConstructorReturn(this, _MultiToken.call(this, value));

		_this23.type = 'email';
		_this23.isLink = true;
		return _this23;
	}

	EMAIL.prototype.toHref = function toHref() {
		return 'mailto:' + this.toString();
	};

	return EMAIL;
}(MultiToken);

/**
	Represents some plain text
	@class TEXT
	@extends MultiToken
*/


var TEXT = function (_MultiToken2) {
	_inherits(TEXT, _MultiToken2);

	function TEXT(value) {
		_classCallCheck(this, TEXT);

		var _this24 = _possibleConstructorReturn(this, _MultiToken2.call(this, value));

		_this24.type = 'text';
		return _this24;
	}

	return TEXT;
}(MultiToken);

/**
	Multi-linebreak token - represents a line break
	@class MNL
	@extends MultiToken
*/


var MNL = function (_MultiToken3) {
	_inherits(MNL, _MultiToken3);

	function MNL(value) {
		_classCallCheck(this, MNL);

		var _this25 = _possibleConstructorReturn(this, _MultiToken3.call(this, value));

		_this25.type = 'nl';
		return _this25;
	}

	return MNL;
}(MultiToken);

/**
	Represents a list of tokens making up a valid URL
	@class URL
	@extends MultiToken
*/


var URL = function (_MultiToken4) {
	_inherits(URL, _MultiToken4);

	function URL(value) {
		_classCallCheck(this, URL);

		var _this26 = _possibleConstructorReturn(this, _MultiToken4.call(this, value));

		_this26.type = 'url';
		_this26.isLink = true;
		return _this26;
	}

	/**
 	Lowercases relevant parts of the domain and adds the protocol if
 	required. Note that this will not escape unsafe HTML characters in the
 	URL.
 		@method href
 	@param {String} protocol
 	@return {String}
 */


	URL.prototype.toHref = function toHref() {
		var protocol = arguments.length <= 0 || arguments[0] === undefined ? 'http' : arguments[0];

		var hasProtocol = false,
		    hasSlashSlash = false,
		    tokens = this.v,
		    result = [],
		    i = 0;

		// Make the first part of the domain lowercase
		// Lowercase protocol
		while (tokens[i] instanceof PROTOCOL) {
			hasProtocol = true;
			result.push(tokens[i].toString().toLowerCase());
			i++;
		}

		// Skip slash-slash
		while (tokens[i] instanceof SLASH) {
			hasSlashSlash = true;
			result.push(tokens[i].toString());
			i++;
		}

		// Lowercase all other characters in the domain
		while (isDomainToken(tokens[i])) {
			result.push(tokens[i].toString().toLowerCase());
			i++;
		}

		// Leave all other characters as they were written
		for (; i < tokens.length; i++) {
			result.push(tokens[i].toString());
		}

		result = result.join('');

		if (!(hasProtocol || hasSlashSlash)) {
			result = protocol + '://' + result;
		}

		return result;
	};

	URL.prototype.hasProtocol = function hasProtocol() {
		return this.v[0] instanceof PROTOCOL;
	};

	return URL;
}(MultiToken);

var multi = {
	Base: MultiToken,
	EMAIL: EMAIL,
	NL: MNL,
	TEXT: TEXT,
	URL: URL
};

exports.text = text;
exports.multi = multi;