// Generated by CoffeeScript 1.10.0
var CoffeeScript, fs, helpers, jsSyntaxTransform, transform;

fs = require('fs');

transform = require('coffee-react-transform');

helpers = require('./helpers');

CoffeeScript = require('coffee-script/lib/coffee-script/coffee-script');

jsSyntaxTransform = require('coffee-react-jstransform');

if (!CoffeeScript._cjsx) {
  CoffeeScript._cjsx = true;
  CoffeeScript.FILE_EXTENSIONS.push('.cjsx');
  CoffeeScript.register = function() {
    return require('./register');
  };
  CoffeeScript._csCompile = CoffeeScript.compile;
  CoffeeScript.compile = function(code, options) {
    var input, output;
    if (options == null) {
      options = {};
    }
    input = transform(code, options);
    output = CoffeeScript._csCompile(input, options);
    if (options.noJSTransforms) {
      return output;
    }
    if (typeof output === 'string') {
      return jsSyntaxTransform(output);
    } else {
      output.js = jsSyntaxTransform(output.js);
      return output;
    }
  };
  CoffeeScript._compileFile = function(filename, sourceMap) {
    var answer, err, error, raw, stripped;
    if (sourceMap == null) {
      sourceMap = false;
    }
    raw = fs.readFileSync(filename, 'utf8');
    stripped = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;
    try {
      answer = CoffeeScript.compile(stripped, {
        filename: filename,
        sourceMap: sourceMap,
        literate: helpers.isLiterate(filename)
      });
    } catch (error) {
      err = error;
      throw helpers.updateSyntaxError(err, stripped, filename);
    }
    return answer;
  };
  CoffeeScript.hasCJSXPragma = helpers.hasCJSXPragma;
  CoffeeScript.hasCJSXExtension = helpers.hasCJSXExtension;
  CoffeeScript.transform = transform;
}

module.exports = CoffeeScript;
