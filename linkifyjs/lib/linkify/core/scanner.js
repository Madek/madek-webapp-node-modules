'use strict';

exports.__esModule = true;
exports.start = exports.run = exports.TOKENS = exports.State = undefined;

var _tokens = require('./tokens');

var _state = require('./state');

/**
	The scanner provides an interface that takes a string of text as input, and
	outputs an array of tokens instances that can be used for easy URL parsing.

	@module linkify
	@submodule scanner
	@main scanner
*/

var tlds = 'abogado|ac|academy|accountants|active|actor|ad|adult|ae|aero|af|ag|agency|ai|airforce|al|allfinanz|alsace|am|an|android|ao|aq|aquarelle|ar|archi|army|arpa|as|asia|associates|at|attorney|au|auction|audio|autos|aw|ax|axa|az|ba|band|bar|bargains|bayern|bb|bd|be|beer|berlin|best|bf|bg|bh|bi|bid|bike|bio|biz|bj|black|blackfriday|bloomberg|blue|bm|bmw|bn|bnpparibas|bo|boo|boutique|br|brussels|bs|bt|budapest|build|builders|business|buzz|bv|bw|by|bz|bzh|ca|cab|cal|camera|camp|cancerresearch|capetown|capital|caravan|cards|care|career|careers|casa|cash|cat|catering|cc|cd|center|ceo|cern|cf|cg|ch|channel|cheap|christmas|chrome|church|ci|citic|city|ck|cl|claims|cleaning|click|clinic|clothing|club|cm|cn|co|coach|codes|coffee|college|cologne|com|community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|country|cr|credit|creditcard|cricket|crs|cruises|cu|cuisinella|cv|cw|cx|cy|cymru|cz|dad|dance|dating|day|de|deals|degree|delivery|democrat|dental|dentist|desi|diamonds|diet|digital|direct|directory|discount|dj|dk|dm|dnp|do|domains|durban|dvag|dz|eat|ec|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|equipment|er|es|esq|estate|et|eu|eurovision|eus|events|everbank|exchange|expert|exposed|fail|farm|fashion|feedback|fi|finance|financial|firmdale|fish|fishing|fitness|fj|fk|flights|florist|flsmidth|fly|fm|fo|foo|forsale|foundation|fr|frl|frogans|fund|furniture|futbol|ga|gal|gallery|gb|gbiz|gd|ge|gent|gf|gg|gh|gi|gift|gifts|gives|gl|glass|gle|global|globo|gm|gmail|gmo|gmx|gn|google|gop|gov|gp|gq|gr|graphics|gratis|green|gripe|gs|gt|gu|guide|guitars|guru|gw|gy|hamburg|haus|healthcare|help|here|hiphop|hiv|hk|hm|hn|holdings|holiday|homes|horse|host|hosting|house|how|hr|ht|hu|ibm|id|ie|il|im|immo|immobilien|in|industries|info|ing|ink|institute|insure|int|international|investments|io|iq|ir|irish|is|it|je|jetzt|jm|jo|jobs|joburg|jp|juegos|kaufen|ke|kg|kh|ki|kim|kitchen|kiwi|km|kn|koeln|kp|kr|krd|kred|kw|ky|kz|la|lacaixa|land|latrobe|lawyer|lb|lc|lds|lease|legal|lgbt|li|life|lighting|limited|limo|link|lk|loans|local|london|lotto|lr|ls|lt|ltda|lu|luxe|luxury|lv|ly|ma|madrid|maison|management|mango|market|marketing|mc|md|me|media|meet|melbourne|meme|memorial|menu|mg|mh|miami|mil|mini|mk|ml|mm|mn|mo|mobi|moda|moe|monash|money|mormon|mortgage|moscow|motorcycles|mov|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|nagoya|name|navy|nc|ne|net|network|neustar|new|nexus|nf|ng|ngo|nhk|ni|ninja|nl|no|np|nr|nra|nrw|nu|nyc|nz|okinawa|om|ong|onl|ooo|org|organic|otsuka|ovh|pa|paris|partners|parts|party|pe|pf|pg|ph|pharmacy|photo|photography|photos|physio|pics|pictures|pink|pizza|pk|pl|place|plumbing|pm|pn|pohl|poker|porn|post|pr|praxi|press|pro|prod|productions|prof|properties|property|ps|pt|pub|pw|py|qa|qpon|quebec|re|realtor|recipes|red|rehab|reise|reisen|reit|ren|rentals|repair|report|republican|rest|restaurant|reviews|rich|rio|rip|ro|rocks|rodeo|rs|rsvp|ru|ruhr|rw|ryukyu|sa|saarland|sarl|sb|sc|sca|scb|schmidt|schule|science|scot|sd|se|services|sexy|sg|sh|shiksha|shoes|si|singles|sj|sk|sl|sm|sn|so|social|software|sohu|solar|solutions|soy|space|spiegel|sr|st|su|supplies|supply|support|surf|surgery|suzuki|sv|sx|sy|sydney|systems|sz|taipei|tatar|tattoo|tax|tc|td|technology|tel|tf|tg|th|tienda|tips|tirol|tj|tk|tl|tm|tn|to|today|tokyo|tools|top|town|toys|tp|tr|trade|training|travel|trust|tt|tui|tv|tw|tz|ua|ug|uk|university|uno|uol|us|uy|uz|va|vacations|vc|ve|vegas|ventures|versicherung|vet|vg|vi|viajes|villas|vision|vlaanderen|vn|vodka|vote|voting|voto|voyage|vu|wales|wang|watch|webcam|website|wed|wedding|wf|whoswho|wien|wiki|williamhill|wme|work|works|world|ws|wtc|wtf|xxx|xyz|yachts|yandex|ye|yoga|yokohama|youtube|yt|za|zip|zm|zone|zw'.split('|'); // macro, see gulpfile.js

var REGEXP_NUM = /[0-9]/,
    REGEXP_ALPHANUM = /[a-z0-9]/,
    COLON = ':';

var domainStates = [],
    // states that jump to DOMAIN on /[a-z0-9]/
makeState = function makeState(tokenClass) {
	return new _state.CharacterState(tokenClass);
};

var // Frequently used tokens
T_DOMAIN = _tokens.text.DOMAIN,
    T_LOCALHOST = _tokens.text.LOCALHOST,
    T_NUM = _tokens.text.NUM,
    T_PROTOCOL = _tokens.text.PROTOCOL,
    T_TLD = _tokens.text.TLD,
    T_WS = _tokens.text.WS;

var // Frequently used states
S_START = makeState(),
    // start state
S_NUM = makeState(T_NUM),
    S_DOMAIN = makeState(T_DOMAIN),
    S_DOMAIN_HYPHEN = makeState(),
    // domain followed by 1 or more hyphen characters
S_WS = makeState(T_WS);

// States for special URL symbols
S_START.on('@', makeState(_tokens.text.AT)).on('.', makeState(_tokens.text.DOT)).on('+', makeState(_tokens.text.PLUS)).on('#', makeState(_tokens.text.POUND)).on('?', makeState(_tokens.text.QUERY)).on('/', makeState(_tokens.text.SLASH)).on(COLON, makeState(_tokens.text.COLON)).on('{', makeState(_tokens.text.OPENBRACE)).on('[', makeState(_tokens.text.OPENBRACKET)).on('(', makeState(_tokens.text.OPENPAREN)).on('}', makeState(_tokens.text.CLOSEBRACE)).on(']', makeState(_tokens.text.CLOSEBRACKET)).on(')', makeState(_tokens.text.CLOSEPAREN)).on(/[,;!]/, makeState(_tokens.text.PUNCTUATION));

// Whitespace jumps
// Tokens of only non-newline whitespace are arbitrarily long
S_START.on(/\n/, makeState(_tokens.text.NL)).on(/\s/, S_WS);

// If any whitespace except newline, more whitespace!
S_WS.on(/[^\S\n]/, S_WS);

// Generates states for top-level domains
// Note that this is most accurate when tlds are in alphabetical order
for (var i = 0; i < tlds.length; i++) {
	var newStates = (0, _state.stateify)(tlds[i], S_START, T_TLD, T_DOMAIN);
	domainStates.push.apply(domainStates, newStates);
}

// Collect the states generated by different protocls
var partialProtocolFileStates = (0, _state.stateify)('file', S_START, T_DOMAIN, T_DOMAIN),
    partialProtocolFtpStates = (0, _state.stateify)('ftp', S_START, T_DOMAIN, T_DOMAIN),
    partialProtocolHttpStates = (0, _state.stateify)('http', S_START, T_DOMAIN, T_DOMAIN);

// Add the states to the array of DOMAINeric states
domainStates.push.apply(domainStates, partialProtocolFileStates);
domainStates.push.apply(domainStates, partialProtocolFtpStates);
domainStates.push.apply(domainStates, partialProtocolHttpStates);

var // Protocol states
S_PROTOCOL_FILE = partialProtocolFileStates.pop(),
    S_PROTOCOL_FTP = partialProtocolFtpStates.pop(),
    S_PROTOCOL_HTTP = partialProtocolHttpStates.pop(),
    S_PROTOCOL_SECURE = makeState(T_DOMAIN),
    S_FULL_PROTOCOL = makeState(T_PROTOCOL); // Full protocol ends with COLON

// Secure protocols (end with 's')
S_PROTOCOL_FTP.on('s', S_PROTOCOL_SECURE).on(COLON, S_FULL_PROTOCOL);

S_PROTOCOL_HTTP.on('s', S_PROTOCOL_SECURE).on(COLON, S_FULL_PROTOCOL);

domainStates.push(S_PROTOCOL_SECURE);

// Become protocol tokens after a COLON
S_PROTOCOL_FILE.on(COLON, S_FULL_PROTOCOL);
S_PROTOCOL_SECURE.on(COLON, S_FULL_PROTOCOL);

// Localhost
var partialLocalhostStates = (0, _state.stateify)('localhost', S_START, T_LOCALHOST, T_DOMAIN);
domainStates.push.apply(domainStates, partialLocalhostStates);

// Everything else
// DOMAINs make more DOMAINs
// Number and character transitions
S_START.on(REGEXP_NUM, S_NUM);
S_NUM.on('-', S_DOMAIN_HYPHEN).on(REGEXP_NUM, S_NUM).on(REGEXP_ALPHANUM, S_DOMAIN); // number becomes DOMAIN

S_DOMAIN.on('-', S_DOMAIN_HYPHEN).on(REGEXP_ALPHANUM, S_DOMAIN);

// All the generated states should have a jump to DOMAIN
for (var _i = 0; _i < domainStates.length; _i++) {
	domainStates[_i].on('-', S_DOMAIN_HYPHEN).on(REGEXP_ALPHANUM, S_DOMAIN);
}

S_DOMAIN_HYPHEN.on('-', S_DOMAIN_HYPHEN).on(REGEXP_NUM, S_DOMAIN).on(REGEXP_ALPHANUM, S_DOMAIN);

// Any other character is considered a single symbol token
S_START.on(/./, makeState(_tokens.text.SYM));

/**
	Given a string, returns an array of TOKEN instances representing the
	composition of that string.

	@method run
	@param {String} str Input string to scan
	@return {Array} Array of TOKEN instances
*/
var run = function run(str) {

	// The state machine only looks at lowercase strings.
	// This selective `toLowerCase` is used because lowercasing the entire
	// string causes the length and character position to vary in some in some
	// non-English strings. This happens only on V8-based runtimes.
	var lowerStr = str.replace(/[A-Z]/g, function (c) {
		return c.toLowerCase();
	});
	var len = str.length;
	var tokens = []; // return value

	var cursor = 0;

	// Tokenize the string
	while (cursor < len) {

		var state = S_START,
		    secondState = null,
		    nextState = null,
		    tokenLength = 0,
		    latestAccepting = null,
		    sinceAccepts = -1;

		while (cursor < len && (nextState = state.next(lowerStr[cursor]))) {
			secondState = null;
			state = nextState;

			// Keep track of the latest accepting state
			if (state.accepts()) {
				sinceAccepts = 0;
				latestAccepting = state;
			} else if (sinceAccepts >= 0) {
				sinceAccepts++;
			}

			tokenLength++;
			cursor++;
		}

		if (sinceAccepts < 0) continue; // Should never happen

		// Roll back to the latest accepting state
		cursor -= sinceAccepts;
		tokenLength -= sinceAccepts;

		// Get the class for the new token
		var TOKEN = latestAccepting.emit(); // Current token class

		// No more jumps, just make a new token
		tokens.push(new TOKEN(str.substr(cursor - tokenLength, tokenLength)));
	}

	return tokens;
};

var start = S_START;
exports.State = _state.CharacterState;
exports.TOKENS = _tokens.text;
exports.run = run;
exports.start = start;