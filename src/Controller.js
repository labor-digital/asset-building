#!/usr/bin/env node
/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
var path = require('path');
const fs = require('fs');
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
	'controller': __dirname + path.sep,
	'nodeModules': process.cwd() + path.sep + 'node_modules' + path.sep,
	'buildingNodeModules': path.resolve(__dirname, '../node_modules/') + path.sep
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
var context = configBuilder(dir, laborConfig, process.argv[2]);

// Start webpack
webpack(context.webpackConfig, (err, stats) => {
	if (err || stats.hasErrors()) {
		if (err) {
			// Handle errors here
			console.error('ERRORS OCCURED!');
			console.error(err.stack || err);
			return;
		}
	}

	// Render a readable output
	var lines = stats.toJson({
		'hash': false,
		'entrypoints': false,
		'colors': false,
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
		'excludeAssets': /ignore-me.js$/
	});

	// Call hooks
	lines = context.callPluginMethod('compilingDone', [lines, context]);

	// Render output
	let time = lines.time > 10000 ? Math.round(lines.time / 100) / 10 + 's' : lines.time + 'ms';
	console.log('');
	console.log('COMPILING DONE:', new Date().toLocaleTimeString(), '| Time:', time);
	console.log('==================================================================================');
	function humanFileSize(size) {
		var i = Math.floor( Math.log(size) / Math.log(1024) );
		return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
	}
	console.log('Asset'.padStart(70, ' ') + '  ' + 'Size'.padStart(10));
	lines.assets.forEach(asset => {
		if(asset.name.match(/\.css\.drop$|\.css\.drop\.map$/)) return;
		if(asset.name.match(/\.drop\.css$/)) asset.name = asset.name.substr(0, asset.name.length-9);
		else if(asset.name.match(/\.drop\.css\.map$/)) asset.name = asset.name.substr(0, asset.name.length-13) + '.map';
		console.log('\x1b[32m' + path.resolve(asset.name).substr(-70).padStart(70, ' ') + '\x1b[0m  ' +
			(humanFileSize(asset.size) + '').padStart(10));
	});

	let state = '\x1b[32mOK\x1b[0m';
	// Render errors
	if(lines.errors.length > 0){
		state = '\x1b[31mERROR\x1b[0m';
		console.log('');
		console.error('ERRORS OCCURED:');
		console.error('==================================================================================');
		let c = 0;
		lines.errors.forEach(error => {
			console.error('\x1b[31mERROR ' + (c++) +':\x1b[0m');
			error.split(/\r?\n/).forEach(l => {
				console.error('\x1b[31m' + l +'\x1b[0m');
			});
			console.log('');
		});
	}
	console.log('..................................................................................');
	console.log(new Date().toLocaleTimeString(), '| Time:', time, '|', state);
});