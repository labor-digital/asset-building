#!/usr/bin/env node
/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var configBuilder = require('./WebpackConfigBuilder');

// Check if mode was given mode
if(typeof process.argv[2] === 'undefined'){
	console.error('You did not transfer a mode parameter (e.g. build, watch) to the call!');
	process.exit();
}

// Prepare directory stroage
var dir = {
	'current': process.cwd() + path.sep,
	'controller': __dirname + path.sep
};

// Load package json
var packageJsonPath = dir.current + 'package.json';
if (!fs.existsSync(packageJsonPath)) {
	console.error('Could not find package.json at: "' + packageJsonPath + '"');
	process.exit();
}
var packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString('utf-8'));
if(typeof packageJson.labor === 'undefined') {
	console.error('There is no "labor" node in your package.json at: "' + packageJsonPath + '"');
	process.exit();
}
var laborConfig = packageJson.labor;

// Build webpack config
var webpackConfig = configBuilder(dir, laborConfig, process.argv[2]);

// Start webpack
webpack(webpackConfig, (err, stats) => {
	if (err || stats.hasErrors()) {
		// Handle errors here
		console.error('ERRORS OCCURED!');
		if (err) {
			console.error(err.stack || err);
			return;
		}
	} else {
		console.log('Compiling done.');
	}

	// Render a readable output
	var lines = stats.toString({
		'hash': false,
		'entrypoints': false,
		'colors': true,
		'moduleTrace': false,
		'verbose': false,
		'version': false,
		'usedExports': false,
		'modules': false,
		'children': false,
		'buildAt': false,
		'assets': true,
		'chunks': false,
		'warnings': true,
		'errorDetails': false,
		'excludeAssets': /.map$/
	}).split(/\n/);
	lines.map(v => {
		// Exclude everything that was not explicitly created by us
		if(v.split('  ').pop() !== '') console.log(v);
	});
});