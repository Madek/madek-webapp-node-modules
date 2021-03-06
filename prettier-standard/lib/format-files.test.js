'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _findUp = require('find-up');

var _findUp2 = _interopRequireDefault(_findUp);

var _prettierEslint = require('prettier-eslint');

var _prettierEslint2 = _interopRequireDefault(_prettierEslint);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _getStdin = require('get-stdin');

var _getStdin2 = _interopRequireDefault(_getStdin);

var _formatFiles = require('./format-files');

var _formatFiles2 = _interopRequireDefault(_formatFiles);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console:0 */
jest.mock('fs');

beforeEach(function () {
  process.stdout.write = jest.fn();
  console.error = jest.fn();
  _prettierEslint2.default.mockClear();
  _fs2.default.writeFile.mockClear();
  _fs2.default.readFile.mockClear();
});

test('sanity test', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  var globs, successOutput;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          globs = ['src/**/1*.js', 'src/**/2*.js'];
          _context.next = 3;
          return (0, _formatFiles2.default)(globs);

        case 3:
          expect(_glob2.default).toHaveBeenCalledTimes(globs.length);
          expect(_fs2.default.readFile).toHaveBeenCalledTimes(6);
          expect(_prettierEslint2.default).toHaveBeenCalledTimes(6);
          expect(_fs2.default.writeFile).toHaveBeenCalledTimes(6);
          expect(console.error).toHaveBeenCalledTimes(1);
          successOutput = expect.stringMatching(/success.*6.*files/);

          expect(console.error).toHaveBeenCalledWith(successOutput);

        case 10:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
})));

test('glob call inclues an ignore of node_modules', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
  var fileGlob, globOptions, callback;
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          fileGlob = 'src/**/1*.js';
          _context2.next = 3;
          return (0, _formatFiles2.default)([fileGlob]);

        case 3:
          globOptions = expect.objectContaining({
            ignore: expect.arrayContaining(['**/node_modules/**'])
          });
          callback = expect.any(Function);

          expect(_glob2.default).toHaveBeenCalledWith(fileGlob, globOptions, callback);

        case 6:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, undefined);
})));

test('glob call excludes an ignore of node_modules', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
  var fileGlob;
  return _regenerator2.default.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          fileGlob = 'foo/node_modules/stuff*.js';
          _context3.next = 3;
          return (0, _formatFiles2.default)([fileGlob]);

        case 3:
          expect(_glob2.default).not.toHaveBeenCalledWith(expect.any, expect.objectContaining({
            // should not have an ignore with **/node_modules/**
            ignore: expect.arrayContaining(['**/node_modules/**'])
          }), expect.any);

        case 4:
        case 'end':
          return _context3.stop();
      }
    }
  }, _callee3, undefined);
})));

test('should accept stdin', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
  var text;
  return _regenerator2.default.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _getStdin2.default.stdin = '  var [ foo, {  bar } ] = window.APP ;';
          _context4.next = 3;
          return (0, _formatFiles2.default)([], { stdin: true });

        case 3:
          expect(_prettierEslint2.default).toHaveBeenCalledTimes(1);
          // the trim is part of the test
          text = _getStdin2.default.stdin.trim();

          expect(_prettierEslint2.default).toHaveBeenCalledWith(expect.objectContaining({ text: text }));
          expect(process.stdout.write).toHaveBeenCalledTimes(1);
          expect(process.stdout.write).toHaveBeenCalledWith('MOCK_OUTPUT for stdin');

        case 8:
        case 'end':
          return _context4.stop();
      }
    }
  }, _callee4, undefined);
})));

test('will write to files if that is specified', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
  var fileGlob;
  return _regenerator2.default.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          fileGlob = 'src/**/1*.js';
          _context5.next = 3;
          return (0, _formatFiles2.default)([fileGlob], { write: true });

        case 3:
          expect(_fs2.default.writeFile).toHaveBeenCalledTimes(4);

        case 4:
        case 'end':
          return _context5.stop();
      }
    }
  }, _callee5, undefined);
})));

test('handles stdin errors gracefully', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
  return _regenerator2.default.wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _getStdin2.default.stdin = 'MOCK_SYNTAX_ERROR';
          _context6.next = 3;
          return (0, _formatFiles2.default)([], { stdin: true });

        case 3:
          expect(console.error).toHaveBeenCalledTimes(1);

        case 4:
        case 'end':
          return _context6.stop();
      }
    }
  }, _callee6, undefined);
})));

test('handles file errors gracefully', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
  var globs, successOutput, failureOutput;
  return _regenerator2.default.wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          globs = ['files-with-syntax-errors/*.js', 'src/**/1*.js'];
          _context7.next = 3;
          return (0, _formatFiles2.default)(globs, { write: true });

        case 3:
          expect(_fs2.default.writeFile).toHaveBeenCalledTimes(4);
          expect(console.error).toHaveBeenCalledTimes(4);
          successOutput = expect.stringMatching(/success.*4.*files/);
          failureOutput = expect.stringMatching(/failure.*2.*files/);

          expect(console.error).toHaveBeenCalledWith(successOutput);
          expect(console.error).toHaveBeenCalledWith(failureOutput);

        case 9:
        case 'end':
          return _context7.stop();
      }
    }
  }, _callee7, undefined);
})));

test('does not print success if there were no successful files', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
  var successOutput;
  return _regenerator2.default.wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return (0, _formatFiles2.default)(['no-match/*.js']);

        case 2:
          successOutput = expect.stringMatching(/unhandled error/);

          expect(console.error).not.toHaveBeenCalledWith(successOutput);

        case 4:
        case 'end':
          return _context8.stop();
      }
    }
  }, _callee8, undefined);
})));

test('fails gracefully if something odd happens', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9() {
  var label, notice, errorStack;
  return _regenerator2.default.wrap(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return (0, _formatFiles2.default)(['throw-error/*.js']);

        case 2:
          expect(console.error).toHaveBeenCalledTimes(1);
          label = expect.stringMatching(/prettier-standard/);
          notice = expect.stringMatching(/unhandled error/);
          errorStack = expect.stringMatching(/something weird happened/);

          expect(console.error).toHaveBeenCalledWith(label, notice, errorStack);

        case 7:
        case 'end':
          return _context9.stop();
      }
    }
  }, _callee9, undefined);
})));

test('logs errors to the console if something goes wrong', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10() {
  var globs, successOutput, failureOutput, errorPrefix, cliError, errorOutput;
  return _regenerator2.default.wrap(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          globs = ['eslint-config-error/*.js', 'src/**/2*.js'];
          _context10.next = 3;
          return (0, _formatFiles2.default)(globs, { write: true });

        case 3:
          expect(_fs2.default.writeFile).toHaveBeenCalledTimes(4);
          expect(console.error).toHaveBeenCalledTimes(4);
          successOutput = expect.stringMatching(/success.*4.*files/);
          failureOutput = expect.stringMatching(/failure.*2.*files/);

          expect(console.error).toHaveBeenCalledWith(successOutput);
          expect(console.error).toHaveBeenCalledWith(failureOutput);
          errorPrefix = expect.stringMatching(/prettier-standard.*ERROR/);
          cliError = expect.stringContaining('eslint-config-error');
          errorOutput = expect.stringContaining('Some weird eslint config error');

          expect(console.error).toHaveBeenCalledTimes(4);
          expect(console.error).toHaveBeenCalledWith(errorPrefix, cliError, errorOutput);

        case 14:
        case 'end':
          return _context10.stop();
      }
    }
  }, _callee10, undefined);
})));

test('forwards logLevel onto prettier-eslint', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11() {
  var options;
  return _regenerator2.default.wrap(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return (0, _formatFiles2.default)(['src/**/1*.js'], { logLevel: 'debug' });

        case 2:
          options = expect.objectContaining({ logLevel: 'debug' });

          expect(_prettierEslint2.default).toHaveBeenCalledWith(options);

        case 4:
        case 'end':
          return _context11.stop();
      }
    }
  }, _callee11, undefined);
})));

test('wont save file if contents did not change', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12() {
  var fileGlob, unchangedOutput;
  return _regenerator2.default.wrap(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          fileGlob = 'no-change/*.js';
          _context12.next = 3;
          return (0, _formatFiles2.default)([fileGlob], { write: true });

        case 3:
          expect(_fs2.default.readFile).toHaveBeenCalledTimes(3);
          expect(_fs2.default.writeFile).toHaveBeenCalledTimes(0);
          unchangedOutput = expect.stringMatching(/3.*?files.*?unchanged/);

          expect(console.error).toHaveBeenCalledWith(unchangedOutput);

        case 7:
        case 'end':
          return _context12.stop();
      }
    }
  }, _callee12, undefined);
})));

test('allows you to specify an ignore glob', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13() {
  var ignore, fileGlob, globOptions, callback;
  return _regenerator2.default.wrap(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          ignore = ['src/ignore/thing', 'src/ignore/otherthing'];
          fileGlob = 'src/**/1*.js';
          _context13.next = 4;
          return (0, _formatFiles2.default)([fileGlob], { ignore: ignore });

        case 4:
          globOptions = expect.objectContaining({
            ignore: [].concat(ignore, ['**/node_modules/**'])
          });
          callback = expect.any(Function);

          expect(_glob2.default).toHaveBeenCalledWith(fileGlob, globOptions, callback);

        case 7:
        case 'end':
          return _context13.stop();
      }
    }
  }, _callee13, undefined);
})));

test('wont modify a file if it is eslint ignored', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14() {
  var ignoredOutput;
  return _regenerator2.default.wrap(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.next = 2;
          return (0, _formatFiles2.default)(['src/**/ignored*.js'], { write: true });

        case 2:
          expect(_fs2.default.readFile).toHaveBeenCalledTimes(1);
          expect(_fs2.default.writeFile).toHaveBeenCalledTimes(1);
          expect(_fs2.default.readFile).toHaveBeenCalledWith(expect.stringMatching(/applied/), 'utf8', expect.any(Function));
          expect(_fs2.default.writeFile).toHaveBeenCalledWith(expect.stringMatching(/applied/), expect.stringMatching(/MOCK_OUTPUT.*?applied/), expect.any(Function));
          ignoredOutput = expect.stringMatching(/success.*1.*file/);

          expect(console.error).toHaveBeenCalledWith(ignoredOutput);

        case 8:
        case 'end':
          return _context14.stop();
      }
    }
  }, _callee14, undefined);
})));

test('will modify a file if it is eslint ignored with noIgnore', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15() {
  var ignoredOutput;
  return _regenerator2.default.wrap(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _context15.next = 2;
          return (0, _formatFiles2.default)(['src/**/ignored*.js'], {
            write: true,
            eslintIgnore: false
          });

        case 2:
          expect(_fs2.default.readFile).toHaveBeenCalledTimes(4);
          expect(_fs2.default.writeFile).toHaveBeenCalledTimes(4);
          ignoredOutput = expect.stringMatching(/success.*4.*files/);

          expect(console.error).toHaveBeenCalledWith(ignoredOutput);

        case 6:
        case 'end':
          return _context15.stop();
      }
    }
  }, _callee15, undefined);
})));

test('will not blow up if an .eslintignore cannot be found', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16() {
  var originalSync;
  return _regenerator2.default.wrap(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          originalSync = _findUp2.default.sync;

          _findUp2.default.sync = function () {
            return null;
          };
          _context16.prev = 2;
          _context16.next = 5;
          return (0, _formatFiles2.default)(['src/**/no-eslint-ignore/*.js'], {
            write: true
          });

        case 5:
          _context16.next = 10;
          break;

        case 7:
          _context16.prev = 7;
          _context16.t0 = _context16['catch'](2);
          throw _context16.t0;

        case 10:
          _context16.prev = 10;

          _findUp2.default.sync = originalSync;
          return _context16.finish(10);

        case 13:
        case 'end':
          return _context16.stop();
      }
    }
  }, _callee16, undefined, [[2, 7, 10, 13]]);
})));