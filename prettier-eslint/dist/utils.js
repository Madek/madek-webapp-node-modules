'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultEslintConfig = exports.getOptionsForFormatting = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _commonTags = require('common-tags');

var _dlv = require('dlv');

var _dlv2 = _interopRequireDefault(_dlv);

var _loglevelColoredLevelPrefix = require('loglevel-colored-level-prefix');

var _loglevelColoredLevelPrefix2 = _interopRequireDefault(_loglevelColoredLevelPrefix);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = (0, _loglevelColoredLevelPrefix2.default)({ prefix: 'prettier-eslint' });
var RULE_DISABLED = {};
var RULE_NOT_CONFIGURED = 'RULE_NOT_CONFIGURED';
var OPTION_GETTERS = {
  printWidth: {
    ruleValue: function ruleValue(rules) {
      return getRuleValue(rules, 'max-len', 'code');
    },
    ruleValueToPrettierOption: getPrintWidth
  },
  tabWidth: {
    ruleValue: function ruleValue(rules) {
      return getRuleValue(rules, 'indent');
    },
    ruleValueToPrettierOption: getTabWidth
  },
  parser: {
    ruleValue: function ruleValue() {
      return RULE_NOT_CONFIGURED;
    },
    ruleValueToPrettierOption: getParser
  },
  singleQuote: {
    ruleValue: function ruleValue(rules) {
      return getRuleValue(rules, 'quotes');
    },
    ruleValueToPrettierOption: getSingleQuote
  },
  trailingComma: {
    ruleValue: function ruleValue(rules) {
      return getRuleValue(rules, 'comma-dangle');
    },
    ruleValueToPrettierOption: getTrailingComma
  },
  bracketSpacing: {
    ruleValue: function ruleValue(rules) {
      return getRuleValue(rules, 'object-curly-spacing');
    },
    ruleValueToPrettierOption: getBracketSpacing
  },
  semi: {
    ruleValue: function ruleValue(rules) {
      return getRuleValue(rules, 'semi');
    },
    ruleValueToPrettierOption: getSemi
  },
  useTabs: {
    ruleValue: function ruleValue(rules) {
      return getRuleValue(rules, 'indent');
    },
    ruleValueToPrettierOption: getUseTabs
  }
};

/* eslint import/prefer-default-export:0 */
exports.getOptionsForFormatting = getOptionsForFormatting;
exports.defaultEslintConfig = defaultEslintConfig;


function defaultEslintConfig() {
  var eslintConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaultConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return (0, _lodash2.default)({}, defaultConfig, eslintConfig);
}

function getOptionsForFormatting(eslintConfig) {
  var prettierOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var fallbackPrettierOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var eslint = getRelevantESLintConfig(eslintConfig);
  var prettier = getPrettierOptionsFromESLintRules(eslint, prettierOptions, fallbackPrettierOptions);
  return { eslint, prettier };
}

function getRelevantESLintConfig(eslintConfig) {
  var rules = eslintConfig.rules;
  // TODO: remove rules that are not fixable for perf
  // this will require we load the config for every rule...
  // not sure that'll be worth the effort
  // but we may be able to maintain a manual list of rules that
  // are definitely not fixable. Which is what we'll do for now...

  var rulesThatWillNeverBeFixable = [
  // TODO add more
  'valid-jsdoc', 'global-require', 'no-with'];

  logger.debug('reducing eslint rules down to relevant rules only');
  var relevantRules = Object.keys(rules).reduce(function (rulesAccumulator, ruleName) {
    if (rulesThatWillNeverBeFixable.indexOf(ruleName) === -1) {
      logger.trace(`adding to relevant rules:`, JSON.stringify({ [ruleName]: rules[ruleName] }));
      rulesAccumulator[ruleName] = rules[ruleName];
    } else {
      logger.trace(`omitting from relevant rules:`, JSON.stringify({ [ruleName]: rules[ruleName] }));
    }
    return rulesAccumulator;
  }, {});

  return _extends({
    // defaults
    useEslintrc: false
  }, eslintConfig, {
    // overrides
    rules: relevantRules,
    fix: true,
    globals: [] });
}

/**
 * This accepts an eslintConfig object and converts
 * it to the `prettier` options object
 */
function getPrettierOptionsFromESLintRules(eslintConfig, prettierOptions, fallbackPrettierOptions) {
  var rules = eslintConfig.rules;


  return Object.keys(OPTION_GETTERS).reduce(function (options, key) {
    return configureOptions(prettierOptions, fallbackPrettierOptions, key, options, rules);
  }, {});
}

// If an ESLint rule that prettier can be configured with is enabled create a
// prettier configuration object that reflects the ESLint rule configuration.
function configureOptions(prettierOptions, fallbackPrettierOptions, key, options, rules) {
  var givenOption = prettierOptions[key];
  var optionIsGiven = givenOption !== undefined;

  if (optionIsGiven) {
    options[key] = givenOption;
  } else {
    var _OPTION_GETTERS$key = OPTION_GETTERS[key],
        ruleValue = _OPTION_GETTERS$key.ruleValue,
        ruleValueToPrettierOption = _OPTION_GETTERS$key.ruleValueToPrettierOption;

    var eslintRuleValue = ruleValue(rules);

    if (eslintRuleValue !== RULE_DISABLED) {
      var prettierOptionValue = ruleValueToPrettierOption(eslintRuleValue, fallbackPrettierOptions, rules);

      if (prettierOptionValue !== RULE_DISABLED) {
        options[key] = prettierOptionValue;
      }
    }
  }

  return options;
}

function getPrintWidth(eslintValue, fallbacks) {
  return makePrettierOption('printWidth', eslintValue, fallbacks, 80);
}

function getTabWidth(eslintValue, fallbacks) {
  // if it's set to tabs, then the tabWidth value doesn't matter
  var prettierValue = eslintValue === 'tab' ? RULE_DISABLED : eslintValue;

  return makePrettierOption('tabWidth', prettierValue, fallbacks, 2);
}

function getParser(eslintValue, fallbacks) {
  // TODO: handle flow parser config
  return makePrettierOption('parser', eslintValue, fallbacks, 'babylon');
}

function getSingleQuote(eslintValue, fallbacks) {
  var prettierValue = void 0;

  if (eslintValue === 'single') {
    prettierValue = true;
  } else if (eslintValue === 'double') {
    prettierValue = false;
  } else if (eslintValue === 'backtick') {
    prettierValue = false;
  } else {
    prettierValue = eslintValue;
  }

  return makePrettierOption('singleQuote', prettierValue, fallbacks, false);
}

function getTrailingComma(value, fallbacks, rules) {
  var prettierValue = void 0;
  var actualValue = rules['comma-dangle'];

  if (value === 'never') {
    prettierValue = 'none';
  } else if (value === 'always') {
    prettierValue = 'es5';
  } else if (typeof actualValue === 'object') {
    prettierValue = getValFromTrailingCommaConfig(actualValue);
  } else {
    prettierValue = RULE_NOT_CONFIGURED;
  }

  return makePrettierOption('trailingComma', prettierValue, fallbacks, 'none');
}

function getValFromTrailingCommaConfig(objectConfig) {
  var _objectConfig = _slicedToArray(objectConfig, 2),
      _objectConfig$ = _objectConfig[1],
      _objectConfig$$arrays = _objectConfig$.arrays,
      arrays = _objectConfig$$arrays === undefined ? '' : _objectConfig$$arrays,
      _objectConfig$$object = _objectConfig$.objects,
      objects = _objectConfig$$object === undefined ? '' : _objectConfig$$object,
      _objectConfig$$functi = _objectConfig$.functions,
      functions = _objectConfig$$functi === undefined ? '' : _objectConfig$$functi;

  var fns = isAlways(functions);
  var es5 = [arrays, objects].some(isAlways);

  if (fns) {
    return 'all';
  } else if (es5) {
    return 'es5';
  } else {
    return 'none';
  }
}

function getBracketSpacing(eslintValue, fallbacks) {
  var prettierValue = void 0;

  if (eslintValue === 'never') {
    prettierValue = false;
  } else if (eslintValue === 'always') {
    prettierValue = true;
  } else {
    prettierValue = eslintValue;
  }

  return makePrettierOption('bracketSpacing', prettierValue, fallbacks, true);
}

function getSemi(eslintValue, fallbacks) {
  var prettierValue = void 0;

  if (eslintValue === 'never') {
    prettierValue = false;
  } else if (eslintValue === 'always') {
    prettierValue = true;
  } else {
    prettierValue = eslintValue;
  }

  return makePrettierOption('semi', prettierValue, fallbacks, true);
}

function getUseTabs(eslintValue, fallbacks) {
  var prettierValue = void 0;

  if (eslintValue === 'tab') {
    prettierValue = true;
  } else {
    prettierValue = RULE_NOT_CONFIGURED;
  }

  return makePrettierOption('useTabs', prettierValue, fallbacks, false);
}

function extractRuleValue(objPath, name, value) {
  if (objPath) {
    logger.trace(_commonTags.oneLine`
        Getting the value from object configuration of ${name}.
        delving into ${JSON.stringify(value)} with path "${objPath}"
      `);

    return (0, _dlv2.default)(value, objPath, RULE_NOT_CONFIGURED);
  }

  logger.debug(_commonTags.oneLine`
      The ${name} rule is using an object configuration
      of ${JSON.stringify(value)} but prettier-eslint is
      not currently capable of getting the prettier value
      based on an object configuration for ${name}.
      Please file an issue (and make a pull request?)
    `);

  return undefined;
}

function getRuleValue(rules, name, objPath) {
  var ruleConfig = rules[name];

  if (Array.isArray(ruleConfig)) {
    var _ruleConfig = _slicedToArray(ruleConfig, 2),
        ruleSetting = _ruleConfig[0],
        value = _ruleConfig[1];

    // If `ruleSetting` is set to disable the ESLint rule don't use `value` as
    // it might be a value provided by an overriden config package e.g. airbnb
    // overriden by config-prettier. The airbnb values are provided even though
    // config-prettier disables the rule. Instead use fallback or prettier
    // default.


    if (ruleSetting === 0 || ruleSetting === 'off') {
      return RULE_DISABLED;
    }

    if (typeof value === 'object') {
      return extractRuleValue(objPath, name, value);
    } else {
      logger.trace(_commonTags.oneLine`
          The ${name} rule is configured with a
          non-object value of ${value}. Using that value.
        `);
      return value;
    }
  }

  return RULE_NOT_CONFIGURED;
}

function isAlways(val) {
  return val.indexOf('always') === 0;
}

function makePrettierOption(prettierRuleName, prettierRuleValue, fallbacks, defaultValue) {
  if (prettierRuleValue !== RULE_NOT_CONFIGURED && typeof prettierRuleValue !== 'undefined') {
    return prettierRuleValue;
  }

  var fallback = fallbacks[prettierRuleName];
  if (typeof fallback !== 'undefined') {
    logger.debug(_commonTags.oneLine`
        The ${prettierRuleName} rule is not configured,
        using provided fallback of ${fallback}
      `);
    return fallback;
  }

  logger.debug(_commonTags.oneLine`
      The ${prettierRuleName} rule is not configured,
      using default of ${defaultValue}
    `);
  return defaultValue;
}