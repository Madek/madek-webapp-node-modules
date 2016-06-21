'use strict';

exports.__esModule = true;
exports.normalize = normalize;
exports.resolve = resolve;
exports.contains = contains;
/**
 * Convert set of options into objects including all the defaults
 */
function normalize(opts) {
	opts = opts || {};
	var newLine = opts.newLine || false; // deprecated
	var ignoreTags = opts.ignoreTags || [];

	// Make all tags names upper case
	for (var i = 0; i < ignoreTags.length; i++) {
		ignoreTags[i] = ignoreTags[i].toUpperCase();
	}

	return {
		attributes: opts.linkAttributes || null,
		defaultProtocol: opts.defaultProtocol || 'http',
		events: opts.events || null,
		format: opts.format || noop,
		validate: opts.validate || yes,
		formatHref: opts.formatHref || noop,
		newLine: opts.newLine || false, // deprecated
		nl2br: !!newLine || opts.nl2br || false,
		tagName: opts.tagName || 'a',
		target: opts.target || typeToTarget,
		linkClass: opts.linkClass || 'linkified',
		ignoreTags: ignoreTags
	};
}

/**
 * Resolve an option's value based on the value of the option and the given
 * params
 */
function resolve(value) {
	for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		params[_key - 1] = arguments[_key];
	}

	return typeof value === 'function' ? value.apply(undefined, params) : value;
}

/**
 * Quick indexOf replacement for checking the ignoreTags option
 */
function contains(arr, value) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == value) {
			return true;
		}
	}
	return false;
}

function noop(val) {
	return val;
}

function yes(val) {
	return true;
}

function typeToTarget(href, type) {
	return type === 'url' ? '_blank' : null;
}