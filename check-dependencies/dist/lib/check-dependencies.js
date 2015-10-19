'use strict';

/* eslint-disable no-undef */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var findup = require('findup-sync');
var _ = require('lodash');
var semver = require('semver');
var Promise = require('bluebird'); // TODO remove when Node.js 0.10 is dropped
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;

/* eslint-enable no-undef */

var checkDependenciesHelper = function (syncOrAsync, config, callback) {
    // We treat the signature:
    //     checkDependencies(callback)
    // as:
    //     checkDependencies({}, callback)

    if (syncOrAsync === 'async') {
        // Catch all cases where `config` is not an object - even if it's not a function
        // so it's useless here, we need it to be assigned to `callback` to provide
        // to the error message.
        if (typeof callback !== 'function' && (typeof config !== 'object' || config == null)) {
            callback = config;
            config = null;}

        if (typeof callback !== 'function') {
            if (callback != null) {
                // If callback was simply not provided, we assume the user wanted
                // to handle the returned promise. If it was passed but not a function
                // we assume user error and throw.
                throw new Error('The provided callback wasn\'t a function! Got:', callback);} else 
            {
                // In the async mode we return the promise anyway; assign callback
                // to noop to keep code consistency.
                callback = _.noop;}}}




    var win32 = process.platform === 'win32';
    var output = { log: [], error: [] };

    var bowerConfig = undefined, depsMappings = undefined, optionalDepsMappings = undefined, fullDepsMappings = undefined, 
    depsDir = undefined, depsDirName = undefined, depsJsonName = undefined, 
    packageJson = undefined, packageJsonName = undefined, packageJsonRegex = undefined, pkgManagerPath = undefined;

    var installPrunePromise = Promise.all([]);
    var success = true;
    var installNeeded = false;
    var pruneNeeded = false;

    var options = _.defaults({}, config, { 
        packageManager: 'npm', 
        onlySpecified: false, 
        install: false, 
        scopeList: ['dependencies', 'devDependencies'], 
        optionalScopeList: ['optionalDependencies'], 
        verbose: false, 
        checkGitUrls: false, 
        checkCustomPackageNames: false, 
        log: console.log.bind(console), 
        error: console.error.bind(console) });


    packageJsonName = options.packageManager === 'npm' ? 'package.json' : 'bower.json';
    packageJsonRegex = options.packageManager === 'npm' ? /package\.json$/ : /bower\.json$/;
    depsDirName = options.packageManager === 'npm' ? 'node_modules' : 'bower_components';

    var log = function (message) {
        output.log.push(message);
        if (options.verbose) {
            options.log(message);}};



    var error = function (message) {
        output.error.push(message);
        if (options.verbose) {
            options.error(message);}};



    var finish = function () {
        output.status = success ? 0 : 1;
        if (syncOrAsync === 'async') {
            callback(output);
            return new Promise(function (resolve) {return resolve(output);});}

        return output;};


    var missingPackageJson = function () {
        success = false;
        error('Missing ' + packageJsonName + '!');
        return finish();};


    options.packageDir = options.packageDir || findup(packageJsonName);
    if (!options.packageDir) {
        return missingPackageJson();}

    options.packageDir = path.resolve(options.packageDir.replace(packageJsonRegex, ''));

    packageJson = options.packageDir + '/' + packageJsonName;
    if (!fs.existsSync(packageJson)) {
        return missingPackageJson();}

    packageJson = require(packageJson);

    if (options.packageManager === 'bower') {
        bowerConfig = require('bower-config').create(options.packageDir).load();
        depsDirName = bowerConfig._config.directory;}


    // Bower uses a different name (with a dot) for package data of dependencies.
    depsJsonName = options.packageManager === 'npm' ? 'package.json' : '.bower.json';

    if (options.packageManager === 'bower') {
        // Allow a local bower.
        pkgManagerPath = findup('node_modules/bower/bin/bower');}


    depsDir = options.packageDir + '/' + depsDirName;

    var getDepsMappingsFromScopeList = function (scopeList) {
        // Get names of all packages specified in package.json/bower.json at keys from scopeList
        // together with specified version numbers.
        return scopeList.reduce(function (result, scope) {return _.merge(result, packageJson[scope] || {});}, {});};


    // Make sure each package from `scopeList` is present and matches the specified version range.
    // Packages from `optionalScopeList` may not be present but if they are, they are required
    // to match the specified version range.
    var checkPackage = function (name, versionString, isOptional) {
        var depVersion = undefined;
        var depDir = depsDir + '/' + name;
        var depJson = depDir + '/' + depsJsonName;

        if (!fs.existsSync(depDir) || !fs.existsSync(depJson)) {
            if (isOptional) {
                log(name + ': ' + chalk.red('not installed!'));} else 
            {
                error(name + ': ' + chalk.red('not installed!'));
                success = false;}

            return;}


        // Let's look if we can get a valid version from a Git URL
        if (options.checkGitUrls && /\.git.*\#v?(.+)$/.test(versionString)) {
            versionString = /\#v?(.+)$/.exec(versionString)[1];
            if (!semver.valid(versionString)) {
                return;}}



        // Quick and dirty check - make sure we're not dealing with a URL
        if (/\//.test(versionString)) {
            return;}


        // Bower has the option to specify a custom name, e.g. 'packageOld' : 'package#1.2.3'
        if (options.checkCustomPackageNames && options.packageManager !== 'npm') {
            // Let's look if we can get a valid version from a custom package name (with a # in it)
            if (/\.*\#v?(.+)$/.test(versionString)) {
                versionString = /\#v?(.+)$/.exec(versionString)[1];
                if (!semver.valid(versionString)) {
                    return;}}}




        // If we are dealing with a custom package name, semver check won't work - skip it
        if (/\#/.test(versionString)) {
            return;}


        // Skip version checks for 'latest' - the semver module won't help here and the check
        // would have to consult the npm server, making the operation slow.
        if (versionString === 'latest') {
            return;}


        depVersion = require(depJson).version;
        if (!semver.satisfies(depVersion, versionString)) {
            success = false;
            error(name + ': installed: ' + chalk.red(depVersion) + ', expected: ' + 
            chalk.green(versionString));} else 
        {
            log(name + ': installed: ' + chalk.green(depVersion) + ', expected: ' + 
            chalk.green(versionString));}};



    depsMappings = getDepsMappingsFromScopeList(options.scopeList);
    optionalDepsMappings = getDepsMappingsFromScopeList(options.optionalScopeList);
    fullDepsMappings = _.assign({}, depsMappings, optionalDepsMappings);

    _.forEach(depsMappings, function (versionString, name) {
        checkPackage(name, versionString, false /* isOptional */);});


    _.forEach(optionalDepsMappings, function (versionString, name) {
        checkPackage(name, versionString, true /* isOptional */);});


    installNeeded = !success;

    if (options.onlySpecified) {
        fs.readdirSync(depsDir)

        // Ignore hidden directories
        .filter(function (depName) {return depName[0] !== '.';})

        // Ignore files
        .filter(function (depName) {return fs.lstatSync(depsDir + '/' + depName).isDirectory();}).

        forEach(function (depName) {
            var depSubDirName = undefined;

            // Scoped packages
            if (depName[0] === '@') {
                depName = fs.readdirSync(depsDir + '/' + depName)[0];

                // Ignore weird directories - if it just looks like a scoped package but
                // isn't one, just skip it.
                if (depSubDirName && !fullDepsMappings[depName]) {
                    success = false;
                    pruneNeeded = true;
                    error('Package ' + depName + ' installed, though it shouldn\'t be');}

                return;}


            // Regular packages
            if (!fullDepsMappings[depName]) {
                success = false;
                pruneNeeded = true;
                error('Package ' + depName + ' installed, though it shouldn\'t be');}});}




    if (success) {
        output.depsWereOk = true;
        return finish();}

    output.depsWereOk = false;

    if (!options.install) {
        if (options.onlySpecified) {
            error('Invoke ' + chalk.green(options.packageManager + ' prune') + ' and ' + 
            chalk.green(options.packageManager + ' install') + ' to install missing packages and remove excessive ones');} else 

        {
            error('Invoke ' + chalk.green(options.packageManager + ' install') + ' to install missing packages');}


        return finish();}



    var installOrPrune = function (mode) {
        log('Invoking ' + chalk.green(options.packageManager + ' ' + mode) + '...');

        // If we're using a direct path, on Windows we need to invoke it via `node path`, not
        // `cmd /c path`. In UNIX systems we can execute the command directly so no need to wrap.
        var msg = undefined, spawnReturn = undefined;
        var method = syncOrAsync === 'sync' ? spawnSync : spawn;

        if (win32) {
            spawnReturn = method(pkgManagerPath ? 'node' : 'cmd', 
            (pkgManagerPath ? [pkgManagerPath] : ['/c', options.packageManager]).concat([mode]), 
            { 
                cwd: options.packageDir, 
                stdio: 'inherit' });} else 

        {
            spawnReturn = method(options.packageManager, 
            [mode], 
            { 
                cwd: options.packageDir, 
                stdio: 'inherit' });}



        if (syncOrAsync === 'sync') {
            if (spawnReturn.status !== 0) {
                msg = options.packageManager + ' ' + mode + ' failed with code: ' + 
                chalk.red(spawnReturn.status);
                throw new Error(msg);}} else 

        {
            return new Promise(function (resolve, reject) {
                spawnReturn.on('close', function (code) {
                    if (code === 0) {
                        resolve();
                        return;}

                    msg = options.packageManager + ' ' + mode + ' failed with code: ' + 
                    chalk.red(code);
                    error(msg);
                    reject(msg);});});}};





    var installMissing = function () {return installOrPrune('install');};
    var pruneExcessive = function () {return installOrPrune('prune');};

    if (syncOrAsync !== 'sync') {
        // TODO disable it in a more clever way?
        Promise.onPossiblyUnhandledRejection();}


    if (syncOrAsync === 'sync') {
        try {
            if (installNeeded) {
                installMissing();}


            if (pruneNeeded) {
                pruneExcessive();}


            success = true;} 
        catch (error) {
            success = false;}

        return finish();}


    // Async scenario
    if (installNeeded) {
        installPrunePromise = installPrunePromise.then(installMissing);}


    if (pruneNeeded) {
        installPrunePromise = installPrunePromise.then(pruneExcessive);}


    return installPrunePromise.
    then(function () {
        success = true;
        return finish();}).

    catch(function () {
        success = false;
        return finish();});};



module.exports = function checkDependencies() /* config, callback */{
    var args = Array.prototype.slice.call(arguments);
    args.unshift('async');
    return checkDependenciesHelper.apply(null, args);};


module.exports.sync = function checkDependenciesSync() /* config */{
    if (!spawnSync) {
        throw new Error([
        'Your version of Node.js doesn\'t support child_process.spawnSync.', 
        'Update Node.js or use require(\'checkDependencies\') instead of', 
        'require(\'checkDependencies\').sync.'].
        join(' '));}

    var args = Array.prototype.slice.call(arguments);
    args.unshift('sync');
    return checkDependenciesHelper.apply(null, args);};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9jaGVjay1kZXBlbmRlbmNpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7O0FBSWIsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0IsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RDLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDN0MsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs7OztBQUlyRCxJQUFNLHVCQUF1QixHQUFHLFVBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUs7Ozs7OztBQU0vRCxRQUFJLFdBQVcsS0FBSyxPQUFPLEVBQUU7Ozs7QUFJekIsWUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEtBQUssT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUEsQUFBQyxFQUFFO0FBQ2xGLG9CQUFRLEdBQUcsTUFBTSxDQUFDO0FBQ2xCLGtCQUFNLEdBQUcsSUFBSSxDQUFDLENBQ2pCOztBQUNELFlBQUksT0FBTyxRQUFRLEtBQUssVUFBVSxFQUFFO0FBQ2hDLGdCQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7Ozs7QUFJbEIsc0JBQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELEVBQUUsUUFBUSxDQUFDLENB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aEIsZUFBTyxNQUFNLEVBQUUsQ0FBQyxDQUNuQixDQUFDLENBQUMsQ0FDVixDQUFDOzs7O0FBRUYsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLGlCQUFpQix5QkFBeUI7QUFDaEUsUUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEIsV0FBTyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQ3BELENBQUM7OztBQUVGLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLFNBQVMscUJBQXFCLGVBQWU7QUFDL0QsUUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNaLGNBQU0sSUFBSSxLQUFLLENBQUM7QUFDWiwyRUFBbUU7QUFDbkUseUVBQWlFO0FBQ2pFLDhDQUFzQyxDQUN6QztBQUFDLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQ2hCOztBQUNELFFBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JCLFdBQU8sdUJBQXVCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUNwRCxDQUFDIiwiZmlsZSI6ImxpYi9jaGVjay1kZXBlbmRlbmNpZXMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL21nb2wvRG9jdW1lbnRzL3Byb2plY3RzL3B1YmxpYy9taW5lL2NoZWNrLWRlcGVuZGVuY2llcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKTtcbmNvbnN0IGZpbmR1cCA9IHJlcXVpcmUoJ2ZpbmR1cC1zeW5jJyk7XG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5jb25zdCBzZW12ZXIgPSByZXF1aXJlKCdzZW12ZXInKTtcbmNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpOyAvLyBUT0RPIHJlbW92ZSB3aGVuIE5vZGUuanMgMC4xMCBpcyBkcm9wcGVkXG5jb25zdCBzcGF3biA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bjtcbmNvbnN0IHNwYXduU3luYyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3blN5bmM7XG5cbi8qIGVzbGludC1lbmFibGUgbm8tdW5kZWYgKi9cblxuY29uc3QgY2hlY2tEZXBlbmRlbmNpZXNIZWxwZXIgPSAoc3luY09yQXN5bmMsIGNvbmZpZywgY2FsbGJhY2spID0+IHtcbiAgICAvLyBXZSB0cmVhdCB0aGUgc2lnbmF0dXJlOlxuICAgIC8vICAgICBjaGVja0RlcGVuZGVuY2llcyhjYWxsYmFjaylcbiAgICAvLyBhczpcbiAgICAvLyAgICAgY2hlY2tEZXBlbmRlbmNpZXMoe30sIGNhbGxiYWNrKVxuXG4gICAgaWYgKHN5bmNPckFzeW5jID09PSAnYXN5bmMnKSB7XG4gICAgICAgIC8vIENhdGNoIGFsbCBjYXNlcyB3aGVyZSBgY29uZmlnYCBpcyBub3QgYW4gb2JqZWN0IC0gZXZlbiBpZiBpdCdzIG5vdCBhIGZ1bmN0aW9uXG4gICAgICAgIC8vIHNvIGl0J3MgdXNlbGVzcyBoZXJlLCB3ZSBuZWVkIGl0IHRvIGJlIGFzc2lnbmVkIHRvIGBjYWxsYmFja2AgdG8gcHJvdmlkZVxuICAgICAgICAvLyB0byB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJyAmJiAodHlwZW9mIGNvbmZpZyAhPT0gJ29iamVjdCcgfHwgY29uZmlnID09IG51bGwpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNvbmZpZztcbiAgICAgICAgICAgIGNvbmZpZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBjYWxsYmFjayB3YXMgc2ltcGx5IG5vdCBwcm92aWRlZCwgd2UgYXNzdW1lIHRoZSB1c2VyIHdhbnRlZFxuICAgICAgICAgICAgICAgIC8vIHRvIGhhbmRsZSB0aGUgcmV0dXJuZWQgcHJvbWlzZS4gSWYgaXQgd2FzIHBhc3NlZCBidXQgbm90IGEgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAvLyB3ZSBhc3N1bWUgdXNlciBlcnJvciBhbmQgdGhyb3cuXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgcHJvdmlkZWQgY2FsbGJhY2sgd2FzblxcJ3QgYSBmdW5jdGlvbiEgR290OicsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gdGhlIGFzeW5jIG1vZGUgd2UgcmV0dXJuIHRoZSBwcm9taXNlIGFueXdheTsgYXNzaWduIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgLy8gdG8gbm9vcCB0byBrZWVwIGNvZGUgY29uc2lzdGVuY3kuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBfLm5vb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB3aW4zMiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG4gICAgY29uc3Qgb3V0cHV0ID0ge2xvZzogW10sIGVycm9yOiBbXX07XG5cbiAgICBsZXQgYm93ZXJDb25maWcsIGRlcHNNYXBwaW5ncywgb3B0aW9uYWxEZXBzTWFwcGluZ3MsIGZ1bGxEZXBzTWFwcGluZ3MsXG4gICAgICAgIGRlcHNEaXIsIGRlcHNEaXJOYW1lLCBkZXBzSnNvbk5hbWUsXG4gICAgICAgIHBhY2thZ2VKc29uLCBwYWNrYWdlSnNvbk5hbWUsIHBhY2thZ2VKc29uUmVnZXgsIHBrZ01hbmFnZXJQYXRoO1xuXG4gICAgbGV0IGluc3RhbGxQcnVuZVByb21pc2UgPSBQcm9taXNlLmFsbChbXSk7XG4gICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuICAgIGxldCBpbnN0YWxsTmVlZGVkID0gZmFsc2U7XG4gICAgbGV0IHBydW5lTmVlZGVkID0gZmFsc2U7XG5cbiAgICBjb25zdCBvcHRpb25zID0gXy5kZWZhdWx0cyh7fSwgY29uZmlnLCB7XG4gICAgICAgIHBhY2thZ2VNYW5hZ2VyOiAnbnBtJyxcbiAgICAgICAgb25seVNwZWNpZmllZDogZmFsc2UsXG4gICAgICAgIGluc3RhbGw6IGZhbHNlLFxuICAgICAgICBzY29wZUxpc3Q6IFsnZGVwZW5kZW5jaWVzJywgJ2RldkRlcGVuZGVuY2llcyddLFxuICAgICAgICBvcHRpb25hbFNjb3BlTGlzdDogWydvcHRpb25hbERlcGVuZGVuY2llcyddLFxuICAgICAgICB2ZXJib3NlOiBmYWxzZSxcbiAgICAgICAgY2hlY2tHaXRVcmxzOiBmYWxzZSxcbiAgICAgICAgY2hlY2tDdXN0b21QYWNrYWdlTmFtZXM6IGZhbHNlLFxuICAgICAgICBsb2c6IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksXG4gICAgICAgIGVycm9yOiBjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSksXG4gICAgfSk7XG5cbiAgICBwYWNrYWdlSnNvbk5hbWUgPSBvcHRpb25zLnBhY2thZ2VNYW5hZ2VyID09PSAnbnBtJyA/ICdwYWNrYWdlLmpzb24nIDogJ2Jvd2VyLmpzb24nO1xuICAgIHBhY2thZ2VKc29uUmVnZXggPSBvcHRpb25zLnBhY2thZ2VNYW5hZ2VyID09PSAnbnBtJyA/IC9wYWNrYWdlXFwuanNvbiQvIDogL2Jvd2VyXFwuanNvbiQvO1xuICAgIGRlcHNEaXJOYW1lID0gb3B0aW9ucy5wYWNrYWdlTWFuYWdlciA9PT0gJ25wbScgPyAnbm9kZV9tb2R1bGVzJyA6ICdib3dlcl9jb21wb25lbnRzJztcblxuICAgIGNvbnN0IGxvZyA9IG1lc3NhZ2UgPT4ge1xuICAgICAgICBvdXRwdXQubG9nLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIGlmIChvcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICAgIG9wdGlvbnMubG9nKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGVycm9yID0gbWVzc2FnZSA9PiB7XG4gICAgICAgIG91dHB1dC5lcnJvci5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICBpZiAob3B0aW9ucy52ZXJib3NlKSB7XG4gICAgICAgICAgICBvcHRpb25zLmVycm9yKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IGZpbmlzaCA9ICgpID0+IHtcbiAgICAgICAgb3V0cHV0LnN0YXR1cyA9IHN1Y2Nlc3MgPyAwIDogMTtcbiAgICAgICAgaWYgKHN5bmNPckFzeW5jID09PSAnYXN5bmMnKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhvdXRwdXQpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcmVzb2x2ZShvdXRwdXQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG5cbiAgICBjb25zdCBtaXNzaW5nUGFja2FnZUpzb24gPSAoKSA9PiB7XG4gICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgZXJyb3IoYE1pc3NpbmcgJHsgcGFja2FnZUpzb25OYW1lIH0hYCk7XG4gICAgICAgIHJldHVybiBmaW5pc2goKTtcbiAgICB9O1xuXG4gICAgb3B0aW9ucy5wYWNrYWdlRGlyID0gb3B0aW9ucy5wYWNrYWdlRGlyIHx8IGZpbmR1cChwYWNrYWdlSnNvbk5hbWUpO1xuICAgIGlmICghb3B0aW9ucy5wYWNrYWdlRGlyKSB7XG4gICAgICAgIHJldHVybiBtaXNzaW5nUGFja2FnZUpzb24oKTtcbiAgICB9XG4gICAgb3B0aW9ucy5wYWNrYWdlRGlyID0gcGF0aC5yZXNvbHZlKG9wdGlvbnMucGFja2FnZURpci5yZXBsYWNlKHBhY2thZ2VKc29uUmVnZXgsICcnKSk7XG5cbiAgICBwYWNrYWdlSnNvbiA9IGAkeyBvcHRpb25zLnBhY2thZ2VEaXIgfS8keyBwYWNrYWdlSnNvbk5hbWUgfWA7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKHBhY2thZ2VKc29uKSkge1xuICAgICAgICByZXR1cm4gbWlzc2luZ1BhY2thZ2VKc29uKCk7XG4gICAgfVxuICAgIHBhY2thZ2VKc29uID0gcmVxdWlyZShwYWNrYWdlSnNvbik7XG5cbiAgICBpZiAob3B0aW9ucy5wYWNrYWdlTWFuYWdlciA9PT0gJ2Jvd2VyJykge1xuICAgICAgICBib3dlckNvbmZpZyA9IHJlcXVpcmUoJ2Jvd2VyLWNvbmZpZycpLmNyZWF0ZShvcHRpb25zLnBhY2thZ2VEaXIpLmxvYWQoKTtcbiAgICAgICAgZGVwc0Rpck5hbWUgPSBib3dlckNvbmZpZy5fY29uZmlnLmRpcmVjdG9yeTtcbiAgICB9XG5cbiAgICAvLyBCb3dlciB1c2VzIGEgZGlmZmVyZW50IG5hbWUgKHdpdGggYSBkb3QpIGZvciBwYWNrYWdlIGRhdGEgb2YgZGVwZW5kZW5jaWVzLlxuICAgIGRlcHNKc29uTmFtZSA9IG9wdGlvbnMucGFja2FnZU1hbmFnZXIgPT09ICducG0nID8gJ3BhY2thZ2UuanNvbicgOiAnLmJvd2VyLmpzb24nO1xuXG4gICAgaWYgKG9wdGlvbnMucGFja2FnZU1hbmFnZXIgPT09ICdib3dlcicpIHtcbiAgICAgICAgLy8gQWxsb3cgYSBsb2NhbCBib3dlci5cbiAgICAgICAgcGtnTWFuYWdlclBhdGggPSBmaW5kdXAoJ25vZGVfbW9kdWxlcy9ib3dlci9iaW4vYm93ZXInKTtcbiAgICB9XG5cbiAgICBkZXBzRGlyID0gYCR7IG9wdGlvbnMucGFja2FnZURpciB9LyR7IGRlcHNEaXJOYW1lIH1gO1xuXG4gICAgY29uc3QgZ2V0RGVwc01hcHBpbmdzRnJvbVNjb3BlTGlzdCA9IHNjb3BlTGlzdCA9PiB7XG4gICAgICAgIC8vIEdldCBuYW1lcyBvZiBhbGwgcGFja2FnZXMgc3BlY2lmaWVkIGluIHBhY2thZ2UuanNvbi9ib3dlci5qc29uIGF0IGtleXMgZnJvbSBzY29wZUxpc3RcbiAgICAgICAgLy8gdG9nZXRoZXIgd2l0aCBzcGVjaWZpZWQgdmVyc2lvbiBudW1iZXJzLlxuICAgICAgICByZXR1cm4gc2NvcGVMaXN0LnJlZHVjZSgocmVzdWx0LCBzY29wZSkgPT4gXy5tZXJnZShyZXN1bHQsIHBhY2thZ2VKc29uW3Njb3BlXSB8fCB7fSksIHt9KTtcbiAgICB9O1xuXG4gICAgLy8gTWFrZSBzdXJlIGVhY2ggcGFja2FnZSBmcm9tIGBzY29wZUxpc3RgIGlzIHByZXNlbnQgYW5kIG1hdGNoZXMgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIHJhbmdlLlxuICAgIC8vIFBhY2thZ2VzIGZyb20gYG9wdGlvbmFsU2NvcGVMaXN0YCBtYXkgbm90IGJlIHByZXNlbnQgYnV0IGlmIHRoZXkgYXJlLCB0aGV5IGFyZSByZXF1aXJlZFxuICAgIC8vIHRvIG1hdGNoIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiByYW5nZS5cbiAgICBjb25zdCBjaGVja1BhY2thZ2UgPSAobmFtZSwgdmVyc2lvblN0cmluZywgaXNPcHRpb25hbCkgPT4ge1xuICAgICAgICBsZXQgZGVwVmVyc2lvbjtcbiAgICAgICAgY29uc3QgZGVwRGlyID0gYCR7IGRlcHNEaXIgfS8keyBuYW1lIH1gO1xuICAgICAgICBjb25zdCBkZXBKc29uID0gYCR7IGRlcERpciB9LyR7IGRlcHNKc29uTmFtZSB9YDtcblxuICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZGVwRGlyKSB8fCAhZnMuZXhpc3RzU3luYyhkZXBKc29uKSkge1xuICAgICAgICAgICAgaWYgKGlzT3B0aW9uYWwpIHtcbiAgICAgICAgICAgICAgICBsb2coYCR7IG5hbWUgfTogJHsgY2hhbGsucmVkKCdub3QgaW5zdGFsbGVkIScpIH1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoYCR7IG5hbWUgfTogJHsgY2hhbGsucmVkKCdub3QgaW5zdGFsbGVkIScpIH1gKTtcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXQncyBsb29rIGlmIHdlIGNhbiBnZXQgYSB2YWxpZCB2ZXJzaW9uIGZyb20gYSBHaXQgVVJMXG4gICAgICAgIGlmIChvcHRpb25zLmNoZWNrR2l0VXJscyAmJiAvXFwuZ2l0LipcXCN2PyguKykkLy50ZXN0KHZlcnNpb25TdHJpbmcpKSB7XG4gICAgICAgICAgICB2ZXJzaW9uU3RyaW5nID0gKC9cXCN2PyguKykkLy5leGVjKHZlcnNpb25TdHJpbmcpKVsxXTtcbiAgICAgICAgICAgIGlmICghc2VtdmVyLnZhbGlkKHZlcnNpb25TdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUXVpY2sgYW5kIGRpcnR5IGNoZWNrIC0gbWFrZSBzdXJlIHdlJ3JlIG5vdCBkZWFsaW5nIHdpdGggYSBVUkxcbiAgICAgICAgaWYgKC9cXC8vLnRlc3QodmVyc2lvblN0cmluZykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJvd2VyIGhhcyB0aGUgb3B0aW9uIHRvIHNwZWNpZnkgYSBjdXN0b20gbmFtZSwgZS5nLiAncGFja2FnZU9sZCcgOiAncGFja2FnZSMxLjIuMydcbiAgICAgICAgaWYgKG9wdGlvbnMuY2hlY2tDdXN0b21QYWNrYWdlTmFtZXMgJiYgb3B0aW9ucy5wYWNrYWdlTWFuYWdlciAhPT0gJ25wbScpIHtcbiAgICAgICAgICAgIC8vIExldCdzIGxvb2sgaWYgd2UgY2FuIGdldCBhIHZhbGlkIHZlcnNpb24gZnJvbSBhIGN1c3RvbSBwYWNrYWdlIG5hbWUgKHdpdGggYSAjIGluIGl0KVxuICAgICAgICAgICAgaWYgKC9cXC4qXFwjdj8oLispJC8udGVzdCh2ZXJzaW9uU3RyaW5nKSkge1xuICAgICAgICAgICAgICAgIHZlcnNpb25TdHJpbmcgPSAoL1xcI3Y/KC4rKSQvLmV4ZWModmVyc2lvblN0cmluZykpWzFdO1xuICAgICAgICAgICAgICAgIGlmICghc2VtdmVyLnZhbGlkKHZlcnNpb25TdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSBhcmUgZGVhbGluZyB3aXRoIGEgY3VzdG9tIHBhY2thZ2UgbmFtZSwgc2VtdmVyIGNoZWNrIHdvbid0IHdvcmsgLSBza2lwIGl0XG4gICAgICAgIGlmICgvXFwjLy50ZXN0KHZlcnNpb25TdHJpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTa2lwIHZlcnNpb24gY2hlY2tzIGZvciAnbGF0ZXN0JyAtIHRoZSBzZW12ZXIgbW9kdWxlIHdvbid0IGhlbHAgaGVyZSBhbmQgdGhlIGNoZWNrXG4gICAgICAgIC8vIHdvdWxkIGhhdmUgdG8gY29uc3VsdCB0aGUgbnBtIHNlcnZlciwgbWFraW5nIHRoZSBvcGVyYXRpb24gc2xvdy5cbiAgICAgICAgaWYgKHZlcnNpb25TdHJpbmcgPT09ICdsYXRlc3QnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkZXBWZXJzaW9uID0gcmVxdWlyZShkZXBKc29uKS52ZXJzaW9uO1xuICAgICAgICBpZiAoIXNlbXZlci5zYXRpc2ZpZXMoZGVwVmVyc2lvbiwgdmVyc2lvblN0cmluZykpIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIGVycm9yKGAkeyBuYW1lIH06IGluc3RhbGxlZDogJHsgY2hhbGsucmVkKGRlcFZlcnNpb24pXG4gICAgICAgICAgICAgICAgfSwgZXhwZWN0ZWQ6ICR7IGNoYWxrLmdyZWVuKHZlcnNpb25TdHJpbmcpIH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZyhgJHsgbmFtZSB9OiBpbnN0YWxsZWQ6ICR7IGNoYWxrLmdyZWVuKGRlcFZlcnNpb24pXG4gICAgICAgICAgICAgICAgfSwgZXhwZWN0ZWQ6ICR7IGNoYWxrLmdyZWVuKHZlcnNpb25TdHJpbmcpIH1gKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkZXBzTWFwcGluZ3MgPSBnZXREZXBzTWFwcGluZ3NGcm9tU2NvcGVMaXN0KG9wdGlvbnMuc2NvcGVMaXN0KTtcbiAgICBvcHRpb25hbERlcHNNYXBwaW5ncyA9IGdldERlcHNNYXBwaW5nc0Zyb21TY29wZUxpc3Qob3B0aW9ucy5vcHRpb25hbFNjb3BlTGlzdCk7XG4gICAgZnVsbERlcHNNYXBwaW5ncyA9IF8uYXNzaWduKHt9LCBkZXBzTWFwcGluZ3MsIG9wdGlvbmFsRGVwc01hcHBpbmdzKTtcblxuICAgIF8uZm9yRWFjaChkZXBzTWFwcGluZ3MsICh2ZXJzaW9uU3RyaW5nLCBuYW1lKSA9PiB7XG4gICAgICAgIGNoZWNrUGFja2FnZShuYW1lLCB2ZXJzaW9uU3RyaW5nLCBmYWxzZSAvKiBpc09wdGlvbmFsICovKTtcbiAgICB9KTtcblxuICAgIF8uZm9yRWFjaChvcHRpb25hbERlcHNNYXBwaW5ncywgKHZlcnNpb25TdHJpbmcsIG5hbWUpID0+IHtcbiAgICAgICAgY2hlY2tQYWNrYWdlKG5hbWUsIHZlcnNpb25TdHJpbmcsIHRydWUgLyogaXNPcHRpb25hbCAqLyk7XG4gICAgfSk7XG5cbiAgICBpbnN0YWxsTmVlZGVkID0gIXN1Y2Nlc3M7XG5cbiAgICBpZiAob3B0aW9ucy5vbmx5U3BlY2lmaWVkKSB7XG4gICAgICAgIGZzLnJlYWRkaXJTeW5jKGRlcHNEaXIpXG5cbiAgICAgICAgICAgIC8vIElnbm9yZSBoaWRkZW4gZGlyZWN0b3JpZXNcbiAgICAgICAgICAgIC5maWx0ZXIoZGVwTmFtZSA9PiBkZXBOYW1lWzBdICE9PSAnLicpXG5cbiAgICAgICAgICAgIC8vIElnbm9yZSBmaWxlc1xuICAgICAgICAgICAgLmZpbHRlcihkZXBOYW1lID0+IGZzLmxzdGF0U3luYyhgJHsgZGVwc0RpciB9LyR7IGRlcE5hbWUgfWApLmlzRGlyZWN0b3J5KCkpXG5cbiAgICAgICAgICAgIC5mb3JFYWNoKGRlcE5hbWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkZXBTdWJEaXJOYW1lO1xuXG4gICAgICAgICAgICAgICAgLy8gU2NvcGVkIHBhY2thZ2VzXG4gICAgICAgICAgICAgICAgaWYgKGRlcE5hbWVbMF0gPT09ICdAJykge1xuICAgICAgICAgICAgICAgICAgICBkZXBOYW1lID0gZnMucmVhZGRpclN5bmMoYCR7IGRlcHNEaXIgfS8keyBkZXBOYW1lIH1gKVswXTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgd2VpcmQgZGlyZWN0b3JpZXMgLSBpZiBpdCBqdXN0IGxvb2tzIGxpa2UgYSBzY29wZWQgcGFja2FnZSBidXRcbiAgICAgICAgICAgICAgICAgICAgLy8gaXNuJ3Qgb25lLCBqdXN0IHNraXAgaXQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXBTdWJEaXJOYW1lICYmICFmdWxsRGVwc01hcHBpbmdzW2RlcE5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcnVuZU5lZWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihgUGFja2FnZSAkeyBkZXBOYW1lIH0gaW5zdGFsbGVkLCB0aG91Z2ggaXQgc2hvdWxkblxcJ3QgYmVgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUmVndWxhciBwYWNrYWdlc1xuICAgICAgICAgICAgICAgIGlmICghZnVsbERlcHNNYXBwaW5nc1tkZXBOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHBydW5lTmVlZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoYFBhY2thZ2UgJHsgZGVwTmFtZSB9IGluc3RhbGxlZCwgdGhvdWdoIGl0IHNob3VsZG5cXCd0IGJlYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgb3V0cHV0LmRlcHNXZXJlT2sgPSB0cnVlO1xuICAgICAgICByZXR1cm4gZmluaXNoKCk7XG4gICAgfVxuICAgIG91dHB1dC5kZXBzV2VyZU9rID0gZmFsc2U7XG5cbiAgICBpZiAoIW9wdGlvbnMuaW5zdGFsbCkge1xuICAgICAgICBpZiAob3B0aW9ucy5vbmx5U3BlY2lmaWVkKSB7XG4gICAgICAgICAgICBlcnJvcihgSW52b2tlICR7IGNoYWxrLmdyZWVuKGAkeyBvcHRpb25zLnBhY2thZ2VNYW5hZ2VyIH0gcHJ1bmVgKSB9IGFuZCAke1xuICAgICAgICAgICAgICAgIGNoYWxrLmdyZWVuKGAkeyBvcHRpb25zLnBhY2thZ2VNYW5hZ2VyIH0gaW5zdGFsbGApXG4gICAgICAgICAgICAgICAgfSB0byBpbnN0YWxsIG1pc3NpbmcgcGFja2FnZXMgYW5kIHJlbW92ZSBleGNlc3NpdmUgb25lc2ApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IoYEludm9rZSAkeyBjaGFsay5ncmVlbihgJHsgb3B0aW9ucy5wYWNrYWdlTWFuYWdlciB9IGluc3RhbGxgKVxuICAgICAgICAgICAgICAgIH0gdG8gaW5zdGFsbCBtaXNzaW5nIHBhY2thZ2VzYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbmlzaCgpO1xuICAgIH1cblxuXG4gICAgY29uc3QgaW5zdGFsbE9yUHJ1bmUgPSBtb2RlID0+IHtcbiAgICAgICAgbG9nKGBJbnZva2luZyAkeyBjaGFsay5ncmVlbihgJHsgb3B0aW9ucy5wYWNrYWdlTWFuYWdlciB9ICR7IG1vZGUgfWApIH0uLi5gKTtcblxuICAgICAgICAvLyBJZiB3ZSdyZSB1c2luZyBhIGRpcmVjdCBwYXRoLCBvbiBXaW5kb3dzIHdlIG5lZWQgdG8gaW52b2tlIGl0IHZpYSBgbm9kZSBwYXRoYCwgbm90XG4gICAgICAgIC8vIGBjbWQgL2MgcGF0aGAuIEluIFVOSVggc3lzdGVtcyB3ZSBjYW4gZXhlY3V0ZSB0aGUgY29tbWFuZCBkaXJlY3RseSBzbyBubyBuZWVkIHRvIHdyYXAuXG4gICAgICAgIGxldCBtc2csIHNwYXduUmV0dXJuO1xuICAgICAgICBjb25zdCBtZXRob2QgPSBzeW5jT3JBc3luYyA9PT0gJ3N5bmMnID8gc3Bhd25TeW5jIDogc3Bhd247XG5cbiAgICAgICAgaWYgKHdpbjMyKSB7XG4gICAgICAgICAgICBzcGF3blJldHVybiA9IG1ldGhvZChwa2dNYW5hZ2VyUGF0aCA/ICdub2RlJyA6ICdjbWQnLFxuICAgICAgICAgICAgICAgIChwa2dNYW5hZ2VyUGF0aCA/IFtwa2dNYW5hZ2VyUGF0aF0gOiBbJy9jJywgb3B0aW9ucy5wYWNrYWdlTWFuYWdlcl0pLmNvbmNhdChbbW9kZV0pLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY3dkOiBvcHRpb25zLnBhY2thZ2VEaXIsXG4gICAgICAgICAgICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzcGF3blJldHVybiA9IG1ldGhvZChvcHRpb25zLnBhY2thZ2VNYW5hZ2VyLFxuICAgICAgICAgICAgICAgIFttb2RlXSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGN3ZDogb3B0aW9ucy5wYWNrYWdlRGlyLFxuICAgICAgICAgICAgICAgICAgICBzdGRpbzogJ2luaGVyaXQnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN5bmNPckFzeW5jID09PSAnc3luYycpIHtcbiAgICAgICAgICAgIGlmIChzcGF3blJldHVybi5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgICAgICAgICBtc2cgPSBgJHsgb3B0aW9ucy5wYWNrYWdlTWFuYWdlciB9ICR7IG1vZGUgfSBmYWlsZWQgd2l0aCBjb2RlOiAke1xuICAgICAgICAgICAgICAgICAgICBjaGFsay5yZWQoc3Bhd25SZXR1cm4uc3RhdHVzKSB9YDtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgc3Bhd25SZXR1cm4ub24oJ2Nsb3NlJywgY29kZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2RlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbXNnID0gYCR7IG9wdGlvbnMucGFja2FnZU1hbmFnZXIgfSAkeyBtb2RlIH0gZmFpbGVkIHdpdGggY29kZTogJHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYWxrLnJlZChjb2RlKSB9YDtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IobXNnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG1zZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBpbnN0YWxsTWlzc2luZyA9ICgpID0+IGluc3RhbGxPclBydW5lKCdpbnN0YWxsJyk7XG4gICAgY29uc3QgcHJ1bmVFeGNlc3NpdmUgPSAoKSA9PiBpbnN0YWxsT3JQcnVuZSgncHJ1bmUnKTtcblxuICAgIGlmIChzeW5jT3JBc3luYyAhPT0gJ3N5bmMnKSB7XG4gICAgICAgIC8vIFRPRE8gZGlzYWJsZSBpdCBpbiBhIG1vcmUgY2xldmVyIHdheT9cbiAgICAgICAgUHJvbWlzZS5vblBvc3NpYmx5VW5oYW5kbGVkUmVqZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKHN5bmNPckFzeW5jID09PSAnc3luYycpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChpbnN0YWxsTmVlZGVkKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFsbE1pc3NpbmcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBydW5lTmVlZGVkKSB7XG4gICAgICAgICAgICAgICAgcHJ1bmVFeGNlc3NpdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbmlzaCgpO1xuICAgIH1cblxuICAgIC8vIEFzeW5jIHNjZW5hcmlvXG4gICAgaWYgKGluc3RhbGxOZWVkZWQpIHtcbiAgICAgICAgaW5zdGFsbFBydW5lUHJvbWlzZSA9IGluc3RhbGxQcnVuZVByb21pc2UudGhlbihpbnN0YWxsTWlzc2luZyk7XG4gICAgfVxuXG4gICAgaWYgKHBydW5lTmVlZGVkKSB7XG4gICAgICAgIGluc3RhbGxQcnVuZVByb21pc2UgPSBpbnN0YWxsUHJ1bmVQcm9taXNlLnRoZW4ocHJ1bmVFeGNlc3NpdmUpO1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0YWxsUHJ1bmVQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZpbmlzaCgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIGZpbmlzaCgpO1xuICAgICAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2hlY2tEZXBlbmRlbmNpZXMoLyogY29uZmlnLCBjYWxsYmFjayAqLykge1xuICAgIGNvbnN0IGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGFyZ3MudW5zaGlmdCgnYXN5bmMnKTtcbiAgICByZXR1cm4gY2hlY2tEZXBlbmRlbmNpZXNIZWxwZXIuYXBwbHkobnVsbCwgYXJncyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gZnVuY3Rpb24gY2hlY2tEZXBlbmRlbmNpZXNTeW5jKC8qIGNvbmZpZyAqLykge1xuICAgIGlmICghc3Bhd25TeW5jKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihbXG4gICAgICAgICAgICAnWW91ciB2ZXJzaW9uIG9mIE5vZGUuanMgZG9lc25cXCd0IHN1cHBvcnQgY2hpbGRfcHJvY2Vzcy5zcGF3blN5bmMuJyxcbiAgICAgICAgICAgICdVcGRhdGUgTm9kZS5qcyBvciB1c2UgcmVxdWlyZShcXCdjaGVja0RlcGVuZGVuY2llc1xcJykgaW5zdGVhZCBvZicsXG4gICAgICAgICAgICAncmVxdWlyZShcXCdjaGVja0RlcGVuZGVuY2llc1xcJykuc3luYy4nLFxuICAgICAgICBdLmpvaW4oJyAnKSk7XG4gICAgfVxuICAgIGNvbnN0IGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIGFyZ3MudW5zaGlmdCgnc3luYycpO1xuICAgIHJldHVybiBjaGVja0RlcGVuZGVuY2llc0hlbHBlci5hcHBseShudWxsLCBhcmdzKTtcbn07XG4iXX0=
