/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */

const path = require('path');
const FileHelpers = require('../Helpers/FileHelpers');

module.exports = function WebpackCallback_1 (context, err, stats){

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
	console.log('Asset'.padStart(70, ' ') + '  ' + 'Size'.padStart(10));
	lines.assets.forEach(asset => {
		if(asset.name.match(/\.css\.drop$|\.css\.drop\.map$/)) return;
		if(asset.name.match(/\.drop\.css$/)) asset.name = asset.name.substr(0, asset.name.length-9);
		else if(asset.name.match(/\.drop\.css\.map$/)) asset.name = asset.name.substr(0, asset.name.length-13) + '.map';
		console.log('\x1b[32m' + path.resolve(asset.name).substr(-70).padStart(70, ' ') + '\x1b[0m  ' +
			(FileHelpers.humanFileSize(asset.size) + '').padStart(10));
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
};