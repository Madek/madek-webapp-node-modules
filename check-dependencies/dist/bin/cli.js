#!/usr/bin/env node
'use strict';



var minimist = require('minimist');
var _ = require('lodash');
var checkDependencies = require('../lib/check-dependencies');

var argv = minimist(process.argv.slice(2));

// camelCase the options
for (var key in argv) {
    var value = argv[key];
    delete argv[key];
    argv[_.camelCase(key)] = value;}


// Options of type array should always have array values
var _arr = ['scopeList', 'optionalScopeList'];for (var _i = 0; _i < _arr.length; _i++) {var option = _arr[_i];
    if (option in argv) {
        if (!Array.isArray(argv[option])) {
            argv[option] = [argv[option]];}}}




// We'll handle verbosity by the CLI here.
var verbose = argv.verbose;
delete argv.verbose;

var Cli = { 
    reporter: function (result) {
        if (verbose) {
            for (var _iterator = result.log, _isArray = Array.isArray(_iterator), _i2 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {var _ref;if (_isArray) {if (_i2 >= _iterator.length) break;_ref = _iterator[_i2++];} else {_i2 = _iterator.next();if (_i2.done) break;_ref = _i2.value;}var msg = _ref;
                console.log(msg);}}



        for (var _iterator2 = result.error, _isArray2 = Array.isArray(_iterator2), _i3 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {var _ref2;if (_isArray2) {if (_i3 >= _iterator2.length) break;_ref2 = _iterator2[_i3++];} else {_i3 = _iterator2.next();if (_i3.done) break;_ref2 = _i3.value;}var msg = _ref2;
            console.error(msg);}


        if (result.error.length > 0) {
            process.exit(1); // eslint-disable-line no-process-exit
        }} };



checkDependencies(argv, Cli.reporter);

module.exports = Cli;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJpbi9jbGkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsWUFBWSxDQUFDOzs7O0FBRWIsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztBQUUvRCxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O0FBRzdDLEtBQUssSUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO0FBQ3BCLFFBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixXQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixRQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUNsQzs7OztXQUdvQixDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQyxDQUF2RCx5Q0FBeUQsQ0FBcEQsSUFBTSxNQUFNLFdBQUEsQ0FBQTtBQUNiLFFBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNoQixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUM5QixnQkFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FDakMsQ0FDSixDQUNKOzs7Ozs7QUFHRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzdCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQzs7QUFFcEIsSUFBTSxHQUFHLEdBQUc7QUFDUixZQUFRLEVBQUEsVUFBQyxNQUFNLEVBQUU7QUFDYixZQUFJLE9BQU8sRUFBRTtBQUNULGlDQUFrQixNQUFNLENBQUMsR0FBRyxtSEFBRSw2SkFBbkIsR0FBRztBQUNWLHVCQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQ3BCLENBQ0o7Ozs7QUFFRCw4QkFBa0IsTUFBTSxDQUFDLEtBQUsseUhBQUUsb0tBQXJCLEdBQUc7QUFDVixtQkFBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUN0Qjs7O0FBRUQsWUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekIsbUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkIsQ0FDSixFQUNKLENBQUM7Ozs7QUFFRixpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUV0QyxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyIsImZpbGUiOiJiaW4vY2xpLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9tZ29sL0RvY3VtZW50cy9wcm9qZWN0cy9wdWJsaWMvbWluZS9jaGVjay1kZXBlbmRlbmNpZXMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBtaW5pbWlzdCA9IHJlcXVpcmUoJ21pbmltaXN0Jyk7XG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5jb25zdCBjaGVja0RlcGVuZGVuY2llcyA9IHJlcXVpcmUoJy4uL2xpYi9jaGVjay1kZXBlbmRlbmNpZXMnKTtcblxuY29uc3QgYXJndiA9IG1pbmltaXN0KHByb2Nlc3MuYXJndi5zbGljZSgyKSk7XG5cbi8vIGNhbWVsQ2FzZSB0aGUgb3B0aW9uc1xuZm9yIChjb25zdCBrZXkgaW4gYXJndikge1xuICAgIGNvbnN0IHZhbHVlID0gYXJndltrZXldO1xuICAgIGRlbGV0ZSBhcmd2W2tleV07XG4gICAgYXJndltfLmNhbWVsQ2FzZShrZXkpXSA9IHZhbHVlO1xufVxuXG4vLyBPcHRpb25zIG9mIHR5cGUgYXJyYXkgc2hvdWxkIGFsd2F5cyBoYXZlIGFycmF5IHZhbHVlc1xuZm9yIChjb25zdCBvcHRpb24gb2YgWydzY29wZUxpc3QnLCAnb3B0aW9uYWxTY29wZUxpc3QnXSkge1xuICAgIGlmIChvcHRpb24gaW4gYXJndikge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJndltvcHRpb25dKSkge1xuICAgICAgICAgICAgYXJndltvcHRpb25dID0gW2FyZ3Zbb3B0aW9uXV07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIFdlJ2xsIGhhbmRsZSB2ZXJib3NpdHkgYnkgdGhlIENMSSBoZXJlLlxuY29uc3QgdmVyYm9zZSA9IGFyZ3YudmVyYm9zZTtcbmRlbGV0ZSBhcmd2LnZlcmJvc2U7XG5cbmNvbnN0IENsaSA9IHtcbiAgICByZXBvcnRlcihyZXN1bHQpIHtcbiAgICAgICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbXNnIG9mIHJlc3VsdC5sb2cpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBtc2cgb2YgcmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmVycm9yLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm9jZXNzLWV4aXRcbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG5jaGVja0RlcGVuZGVuY2llcyhhcmd2LCBDbGkucmVwb3J0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENsaTtcbiJdfQ==
