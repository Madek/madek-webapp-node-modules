'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var formatStdin = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(prettierESLintOptions) {
    var stdinValue, formatted;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _getStdin2.default)();

          case 2:
            stdinValue = _context.sent.trim();
            _context.prev = 3;
            formatted = (0, _prettierEslint2.default)((0, _assign2.default)({ text: stdinValue }, prettierESLintOptions));

            process.stdout.write(formatted);
            return _context.abrupt('return', _promise2.default.resolve(formatted));

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](3);

            logger.error('There was a problem trying to format the stdin text', '\n' + (0, _indentString2.default)(_context.t0.stack, 4));
            process.exitCode = 1;
            return _context.abrupt('return', _promise2.default.resolve(stdinValue));

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 9]]);
  }));

  return function formatStdin(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

var _prettierEslint = require('prettier-eslint');

var _prettierEslint2 = _interopRequireDefault(_prettierEslint);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _getStdin = require('get-stdin');

var _getStdin2 = _interopRequireDefault(_getStdin);

var _ignore = require('ignore');

var _ignore2 = _interopRequireDefault(_ignore);

var _findUp = require('find-up');

var _findUp2 = _interopRequireDefault(_findUp);

var _lodash = require('lodash.memoize');

var _lodash2 = _interopRequireDefault(_lodash);

var _indentString = require('indent-string');

var _indentString2 = _interopRequireDefault(_indentString);

var _loglevelColoredLevelPrefix = require('loglevel-colored-level-prefix');

var _loglevelColoredLevelPrefix2 = _interopRequireDefault(_loglevelColoredLevelPrefix);

var _messages = require('./messages');

var messages = _interopRequireWildcard(_messages);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LINE_SEPERATOR_REGEX = /(\r|\n|\r\n)/; /* eslint no-console:0 */

var rxGlob = _Rx2.default.Observable.bindNodeCallback(_glob2.default);
var rxReadFile = _Rx2.default.Observable.bindNodeCallback(_fs2.default.readFile);
var rxWriteFile = _Rx2.default.Observable.bindNodeCallback(_fs2.default.writeFile);
var findUpSyncMemoized = (0, _lodash2.default)(findUpSync, function resolver() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.join('::');
});
var getIsIgnoredMemoized = (0, _lodash2.default)(getIsIgnored);

var logger = (0, _loglevelColoredLevelPrefix2.default)({ prefix: 'prettier-standard' });

function getPathInHostNodeModules(module) {
  var modulePath = _findUp2.default.sync('node_modules/' + module);

  if (modulePath) {
    return modulePath;
  }

  var result = _findUp2.default.sync('node_modules/' + module, { cwd: __dirname });

  return result;
}

function coercePath(input) {
  return _path2.default.isAbsolute(input) ? input : _path2.default.join(process.cwd(), input);
}

function formatFilesFromArgv(fileGlobs) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$logLevel = _ref.logLevel,
      logLevel = _ref$logLevel === undefined ? logger.getLevel() : _ref$logLevel,
      _ref$eslintPath = _ref.eslintPath,
      eslintPath = _ref$eslintPath === undefined ? getPathInHostNodeModules('eslint') : _ref$eslintPath,
      _ref$prettierPath = _ref.prettierPath,
      prettierPath = _ref$prettierPath === undefined ? getPathInHostNodeModules('prettier') : _ref$prettierPath,
      _ref$ignore = _ref.ignore,
      ignoreGlobs = _ref$ignore === undefined ? [] : _ref$ignore,
      _ref$eslintIgnore = _ref.eslintIgnore,
      applyEslintIgnore = _ref$eslintIgnore === undefined ? true : _ref$eslintIgnore;

  logger.setLevel(logLevel);
  var prettierESLintOptions = {
    logLevel: logLevel,
    eslintPath: eslintPath,
    prettierPath: prettierPath,
    eslintConfig: {
      parser: getPathInHostNodeModules('babel-eslint'),
      parserOptions: {
        ecmaVersion: 8,
        ecmaFeatures: {
          experimentalObjectRestSpread: true,
          jsx: true
        },
        sourceType: 'module'
      },
      rules: {
        'arrow-spacing': ['error', {
          before: true,
          after: true
        }],
        'block-spacing': ['error', 'always'],
        'brace-style': ['error', '1tbs', {
          allowSingleLine: true
        }],
        'comma-dangle': ['error', {
          arrays: 'never',
          objects: 'never',
          imports: 'never',
          exports: 'never',
          functions: 'never'
        }],
        'comma-spacing': ['error', {
          before: false,
          after: true
        }],
        'comma-style': ['error', 'last'],
        curly: ['error', 'multi-line'],
        'dot-location': ['error', 'property'],
        'eol-last': 'error',
        eqeqeq: ['error', 'always', {
          null: 'ignore'
        }],
        'func-call-spacing': ['error', 'never'],
        'generator-star-spacing': ['error', {
          before: true,
          after: true
        }],
        indent: ['error', 2, {
          SwitchCase: 1
        }],
        'key-spacing': ['error', {
          beforeColon: false,
          afterColon: true
        }],
        'keyword-spacing': ['error', {
          before: true,
          after: true
        }],
        'new-parens': 'error',
        'no-debugger': 'error',
        'no-extra-bind': 'error',
        'no-extra-boolean-cast': 'error',
        'no-extra-parens': ['error', 'functions'],
        'no-floating-decimal': 'error',
        'no-multi-spaces': 'error',
        'no-multiple-empty-lines': ['error', {
          max: 1,
          maxEOF: 0
        }],
        'no-regex-spaces': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-unneeded-ternary': ['error', {
          defaultAssignment: false
        }],
        'no-unsafe-negation': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'error',
        'no-whitespace-before-property': 'error',
        'object-property-newline': ['error', {
          allowMultiplePropertiesPerLine: true
        }],
        'operator-linebreak': ['error', 'after', {
          overrides: {
            '?': 'before',
            ':': 'before'
          }
        }],
        'padded-blocks': ['error', {
          blocks: 'never',
          switches: 'never',
          classes: 'never'
        }],
        quotes: ['error', 'single', {
          avoidEscape: true,
          allowTemplateLiterals: true
        }],
        'rest-spread-spacing': ['error', 'never'],
        semi: ['error', 'never'],
        'semi-spacing': ['error', {
          before: false,
          after: true
        }],
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', 'always'],
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': 'error',
        'space-unary-ops': ['error', {
          words: true,
          nonwords: false
        }],
        'spaced-comment': ['error', 'always', {
          line: {
            markers: ['*package', '!', '/', ',']
          },
          block: {
            balanced: true,
            markers: ['*package', '!', ',', ':', '::', 'flow-include'],
            exceptions: ['*']
          }
        }],
        'template-curly-spacing': ['error', 'never'],
        'template-tag-spacing': ['error', 'never'],
        'unicode-bom': ['error', 'never'],
        'wrap-iife': ['error', 'any', {
          functionPrototypeMethods: true
        }],
        'yield-star-spacing': ['error', 'both'],
        yoda: ['error', 'never'],
        'jsx-quotes': ['error', 'prefer-single']
      }
    }
  };

  if (fileGlobs.length > 0) {
    return formatFilesFromGlobs(fileGlobs, [].concat((0, _toConsumableArray3.default)(ignoreGlobs)), // make a copy to avoid manipulation
    { write: true }, prettierESLintOptions, applyEslintIgnore);
  }

  return formatStdin(prettierESLintOptions);
}

function formatFilesFromGlobs(fileGlobs, ignoreGlobs, cliOptions, prettierESLintOptions, applyEslintIgnore) {
  var concurrentGlobs = 3;
  var concurrentFormats = 10;
  return new _promise2.default(function (resolve) {
    var successes = [];
    var failures = [];
    var unchanged = [];
    _Rx2.default.Observable.from(fileGlobs).mergeMap(getFilesFromGlob.bind(null, ignoreGlobs, applyEslintIgnore), null, concurrentGlobs).concatAll().distinct().mergeMap(filePathToFormatted, null, concurrentFormats).subscribe(onNext, onError, onComplete);

    function filePathToFormatted(filePath) {
      return formatFile(filePath, prettierESLintOptions, cliOptions);
    }

    function onNext(info) {
      if (info.error) {
        failures.push(info);
      } else if (info.unchanged) {
        unchanged.push(info);
      } else {
        successes.push(info);
      }
    }

    function onError(error) {
      logger.error('There was an unhandled error while formatting the files', '\n' + (0, _indentString2.default)(error.stack, 4));
      process.exitCode = 1;
      resolve({ error: error, successes: successes, failures: failures });
    }

    function onComplete() {
      if (successes.length) {
        console.error(messages.success({
          success: _chalk2.default.green('success'),
          count: successes.length,
          countString: _chalk2.default.bold(successes.length)
        }));
      }
      if (failures.length) {
        process.exitCode = 1;
        console.error(messages.failure({
          failure: _chalk2.default.red('failure'),
          count: failures.length,
          countString: _chalk2.default.bold(failures.length)
        }));
      }
      if (unchanged.length) {
        console.error(messages.unchanged({
          unchanged: _chalk2.default.gray('unchanged'),
          count: unchanged.length,
          countString: _chalk2.default.bold(unchanged.length)
        }));
      }
      resolve({ successes: successes, failures: failures });
    }
  });
}

function getFilesFromGlob(ignoreGlobs, applyEslintIgnore, fileGlob) {
  var globOptions = { ignore: ignoreGlobs };
  if (!fileGlob.includes('node_modules')) {
    // basically, we're going to protect you from doing something
    // not smart unless you explicitly include it in your glob
    globOptions.ignore.push('**/node_modules/**');
  }
  return rxGlob(fileGlob, globOptions).map(function (filePaths) {
    return filePaths.filter(function (filePath) {
      return applyEslintIgnore ? !isFilePathMatchedByEslintignore(filePath) : true;
    });
  });
}

function formatFile(filePath, prettierESLintOptions, cliOptions) {
  var fileInfo = { filePath: filePath };
  var format$ = rxReadFile(filePath, 'utf8').map(function (text) {
    fileInfo.text = text;
    fileInfo.formatted = (0, _prettierEslint2.default)((0, _assign2.default)({ text: text, filePath: filePath }, prettierESLintOptions));
    return fileInfo;
  });

  if (cliOptions.write) {
    format$ = format$.mergeMap(function (info) {
      if (info.text === info.formatted) {
        return _Rx2.default.Observable.of((0, _assign2.default)(fileInfo, { unchanged: true }));
      } else {
        return rxWriteFile(filePath, info.formatted).map(function () {
          return fileInfo;
        });
      }
    });
  } else {
    format$ = format$.map(function (info) {
      console.error(info.formatted);
      return info;
    });
  }

  return format$.catch(function (error) {
    logger.error('There was an error formatting "' + fileInfo.filePath + '":', '\n' + (0, _indentString2.default)(error.stack, 4));
    return _Rx2.default.Observable.of((0, _assign2.default)(fileInfo, { error: error }));
  });
}

function getNearestEslintignorePath(filePath) {
  var _path$parse = _path2.default.parse(filePath),
      dir = _path$parse.dir;

  return findUpSyncMemoized('.eslintignore', dir);
}

function isFilePathMatchedByEslintignore(filePath) {
  var eslintignorePath = getNearestEslintignorePath(filePath);
  if (!eslintignorePath) {
    return false;
  }

  var eslintignoreDir = _path2.default.parse(eslintignorePath).dir;
  var filePathRelativeToEslintignoreDir = _path2.default.relative(eslintignoreDir, filePath);
  var isIgnored = getIsIgnoredMemoized(eslintignorePath);
  return isIgnored(filePathRelativeToEslintignoreDir);
}

function findUpSync(filename, cwd) {
  return _findUp2.default.sync('.eslintignore', { cwd: cwd });
}

function getIsIgnored(filename) {
  var ignoreLines = _fs2.default.readFileSync(filename, 'utf8').split(LINE_SEPERATOR_REGEX).filter(function (line) {
    return Boolean(line.trim());
  });
  var instance = (0, _ignore2.default)();
  instance.add(ignoreLines);
  return instance.ignores.bind(instance);
}

exports.default = formatFilesFromArgv;