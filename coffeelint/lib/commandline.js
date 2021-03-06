
/*
CoffeeLint

Copyright (c) 2011 Matthew Perpick.
CoffeeLint is freely distributable under the MIT license.
 */

(function() {
  var Cache, CoffeeScript, coffeelint, config, configfinder, coreReporters, data, deprecatedReporter, errorReport, findCoffeeScripts, fs, getAllExtention, getFallbackConfig, glob, ignore, jsonIndentation, lintFiles, lintSource, loadConfig, log, logConfig, optimist, options, os, path, paths, read, readConfigFile, ref, reportAndExit, resolve, ruleLoader, scripts, stdin, stripComments, thisdir, userConfig;

  resolve = require('resolve').sync;

  path = require('path');

  fs = require('fs');

  os = require('os');

  glob = require('glob');

  optimist = require('optimist');

  ignore = require('ignore');

  stripComments = require('strip-json-comments');

  thisdir = path.dirname(fs.realpathSync(__filename));

  coffeelint = require(path.join(thisdir, 'coffeelint'));

  configfinder = require(path.join(thisdir, 'configfinder'));

  ruleLoader = require(path.join(thisdir, 'ruleLoader'));

  Cache = require(path.join(thisdir, 'cache'));

  CoffeeScript = require('coffee-script');

  CoffeeScript.register();

  log = function() {
    return console.log.apply(console, arguments);
  };

  jsonIndentation = 2;

  logConfig = function(config) {
    var filter;
    filter = function(k, v) {
      if (k !== 'message' && k !== 'description' && k !== 'name') {
        return v;
      }
    };
    return log(JSON.stringify(config, filter, jsonIndentation));
  };

  read = function(path) {
    var realPath;
    realPath = fs.realpathSync(path);
    return fs.readFileSync(realPath).toString();
  };

  getAllExtention = function(extension) {
    if (extension != null) {
      extension = ['coffee'].concat(extension != null ? extension.split(',') : void 0);
      return "@(" + (extension.join('|')) + ")";
    } else {
      return 'coffee';
    }
  };

  findCoffeeScripts = function(paths, extension) {
    var allExtention, files, i, len, p;
    files = [];
    allExtention = getAllExtention(extension);
    for (i = 0, len = paths.length; i < len; i++) {
      p = paths[i];
      if (fs.statSync(p).isDirectory()) {
        files = files.concat(glob.sync(p + "/**/*." + allExtention));
      } else {
        files.push(p);
      }
    }
    return files.map(function(p) {
      return path.join(p);
    });
  };

  lintFiles = function(files, config) {
    var errorReport, file, fileConfig, i, len, literate, source;
    errorReport = new coffeelint.getErrorReport();
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      source = read(file);
      literate = CoffeeScript.helpers.isLiterate(file);
      fileConfig = config ? config : getFallbackConfig(file);
      errorReport.lint(file, source, fileConfig, literate);
    }
    return errorReport;
  };

  lintSource = function(source, config, literate) {
    var errorReport;
    if (literate == null) {
      literate = false;
    }
    errorReport = new coffeelint.getErrorReport();
    config || (config = getFallbackConfig());
    errorReport.lint('stdin', source, config, literate);
    return errorReport;
  };

  readConfigFile = function(path) {
    var text;
    text = read(path);
    try {
      jsonIndentation = text.split('\n')[1].match(/^\s+/)[0].length;
    } catch (error) {}
    return JSON.parse(stripComments(text));
  };

  loadConfig = function(options) {
    var config;
    config = null;
    if (!options.argv.noconfig) {
      if (options.argv.f) {
        config = readConfigFile(options.argv.f);
        if (config.coffeelintConfig) {
          config = config.coffeelintConfig;
        }
      }
    }
    return config;
  };

  getFallbackConfig = function(filename) {
    if (filename == null) {
      filename = null;
    }
    if (!options.argv.noconfig) {
      return configfinder.getConfig(filename);
    }
  };

  deprecatedReporter = function(errorReport, reporter) {
    var base;
    if ((base = errorReport.paths)['coffeelint_fake_file.coffee'] == null) {
      base['coffeelint_fake_file.coffee'] = [];
    }
    errorReport.paths['coffeelint_fake_file.coffee'].push({
      'level': 'warn',
      'rule': 'commandline',
      'message': "parameter --" + reporter + " is deprecated. Use --reporter " + reporter + " instead",
      'lineNumber': 0
    });
    return reporter;
  };

  coreReporters = {
    "default": require(path.join(thisdir, 'reporters', 'default')),
    csv: require(path.join(thisdir, 'reporters', 'csv')),
    jslint: require(path.join(thisdir, 'reporters', 'jslint')),
    checkstyle: require(path.join(thisdir, 'reporters', 'checkstyle')),
    raw: require(path.join(thisdir, 'reporters', 'raw'))
  };

  reportAndExit = function(errorReport, options) {
    var SelectedReporter, base, colorize, ref, reporter, strReporter;
    strReporter = options.argv.jslint ? deprecatedReporter(errorReport, 'jslint') : options.argv.csv ? deprecatedReporter(errorReport, 'csv') : options.argv.checkstyle ? deprecatedReporter(errorReport, 'checkstyle') : options.argv.reporter;
    if (strReporter == null) {
      strReporter = 'default';
    }
    SelectedReporter = (ref = coreReporters[strReporter]) != null ? ref : (function() {
      var reporterPath;
      try {
        reporterPath = resolve(strReporter, {
          basedir: process.cwd(),
          extensions: ['.js', '.coffee', '.litcoffee', '.coffee.md']
        });
      } catch (error) {
        reporterPath = strReporter;
      }
      return require(reporterPath);
    })();
    if ((base = options.argv).color == null) {
      base.color = options.argv.nocolor ? 'never' : 'auto';
    }
    colorize = (function() {
      switch (options.argv.color) {
        case 'always':
          return true;
        case 'never':
          return false;
        default:
          return process.stdout.isTTY;
      }
    })();
    reporter = new SelectedReporter(errorReport, {
      colorize: colorize,
      quiet: options.argv.q
    });
    reporter.publish();
    return process.on('exit', function() {
      return process.exit(errorReport.getExitCode());
    });
  };

  options = optimist.usage('Usage: coffeelint [options] source [...]').alias('f', 'file').alias('h', 'help').alias('v', 'version').alias('s', 'stdin').alias('q', 'quiet').alias('c', 'cache').describe('f', 'Specify a custom configuration file.').describe('rules', 'Specify a custom rule or directory of rules.').describe('makeconfig', 'Prints a default config file').describe('trimconfig', 'Compares your config with the default and prints a minimal configuration').describe('noconfig', 'Ignores any config file.').describe('h', 'Print help information.').describe('v', 'Print current version number.').describe('r', '(not used, but left for backward compatibility)').describe('reporter', 'built in reporter (default, csv, jslint, checkstyle, raw), or module, or path to reporter file.').describe('csv', '[deprecated] use --reporter csv').describe('jslint', '[deprecated] use --reporter jslint').describe('nocolor', '[deprecated] use --color=never').describe('checkstyle', '[deprecated] use --reporter checkstyle').describe('color=<when>', 'When to colorize the output. <when> can be one of always, never , or auto.').describe('s', 'Lint the source from stdin').describe('q', 'Only print errors.').describe('literate', 'Used with --stdin to process as Literate CoffeeScript').describe('c', 'Cache linting results').describe('ext', 'Specify an additional file extension, separated by comma.').boolean('csv').boolean('jslint').boolean('checkstyle').boolean('nocolor').boolean('noconfig').boolean('makeconfig').boolean('trimconfig').boolean('literate').boolean('r').boolean('s').boolean('q', 'Print errors only.').boolean('c');

  if (options.argv.v) {
    log(coffeelint.VERSION);
    process.exit(0);
  } else if (options.argv.h) {
    options.showHelp();
    process.exit(0);
  } else if (options.argv.trimconfig) {
    userConfig = (ref = loadConfig(options)) != null ? ref : getFallbackConfig();
    logConfig(coffeelint.trimConfig(userConfig));
  } else if (options.argv.makeconfig) {
    logConfig(coffeelint.getRules());
  } else if (options.argv._.length < 1 && !options.argv.s) {
    options.showHelp();
    process.exit(1);
  } else {
    if (options.argv.cache) {
      coffeelint.setCache(new Cache(path.join(os.tmpdir(), 'coffeelint')));
    }
    config = loadConfig(options);
    if (options.argv.rules) {
      ruleLoader.loadRule(coffeelint, options.argv.rules);
    }
    if (options.argv.s) {
      data = '';
      stdin = process.openStdin();
      stdin.on('data', function(buffer) {
        if (buffer) {
          return data += buffer.toString();
        }
      });
      stdin.on('end', function() {
        var errorReport;
        errorReport = lintSource(data, config, options.argv.literate);
        return reportAndExit(errorReport, options);
      });
    } else {
      paths = options.argv._;
      scripts = findCoffeeScripts(paths, options.argv.ext);
      if (fs.existsSync('.coffeelintignore')) {
        scripts = ignore().add(fs.readFileSync('.coffeelintignore').toString()).filter(scripts);
      }
      errorReport = lintFiles(scripts, config, options.argv.literate);
      reportAndExit(errorReport, options);
    }
  }

}).call(this);
