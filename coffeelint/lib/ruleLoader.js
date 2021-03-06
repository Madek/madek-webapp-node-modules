(function() {
  var path, resolve;

  path = require('path');

  resolve = require('resolve').sync;

  module.exports = {
    require: function(moduleName) {
      var rulePath;
      try {
        rulePath = resolve(moduleName, {
          basedir: process.cwd(),
          extensions: ['.js', '.coffee', '.litcoffee', '.coffee.md']
        });
        return require(rulePath);
      } catch (error) {}
      try {
        return require(moduleName);
      } catch (error) {}
      try {
        return require(path.resolve(process.cwd(), moduleName));
      } catch (error) {}
      return require(moduleName);
    },
    loadFromConfig: function(coffeelint, config) {
      var data, results, ruleName;
      results = [];
      for (ruleName in config) {
        data = config[ruleName];
        if ((data != null ? data.module : void 0) != null) {
          results.push(this.loadRule(coffeelint, data.module, ruleName));
        }
      }
      return results;
    },
    loadRule: function(coffeelint, moduleName, ruleName) {
      var e, i, len, results, rule, ruleModule;
      if (ruleName == null) {
        ruleName = void 0;
      }
      try {
        ruleModule = this.require(moduleName);
        if (typeof ruleModule === 'function') {
          return coffeelint.registerRule(ruleModule, ruleName);
        } else {
          results = [];
          for (i = 0, len = ruleModule.length; i < len; i++) {
            rule = ruleModule[i];
            results.push(coffeelint.registerRule(rule));
          }
          return results;
        }
      } catch (error) {
        e = error;
        console.error("Error loading " + moduleName);
        throw e;
      }
    }
  };

}).call(this);
