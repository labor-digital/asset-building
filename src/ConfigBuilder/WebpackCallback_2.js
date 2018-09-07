/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
const humanFileSize = require('../Helpers/humanFileSize');
const kill = require('../Helpers/kill');

function colorRed(string) {
	return '\x1b[91m' + string + '\x1b[0m';
}

function colorGreen(string) {
	return '\x1b[32m' + string + '\x1b[0m';
}

function colorYellow(string) {
	return '\x1b[93m' + string + '\x1b[0m';
}

function getLine(char) {
	char = typeof char === 'string' ? char : '=';
	return char.repeat(90);
}

module.exports = function WebpackCallback_2(context, err, stats) {
	if (err) kill(err.stack || err);

	// Generate output
	let output = stats.toJson({
		'assets': true,
		'errorDetails': false
	});

	// Call hooks
	output = context.callPluginMethod('compilingDone', [output, context]);

	// Define column char lengths
	const assetColLength = 70;
	const sizeColLength = 14;

	// Render output
	console.log('');
	console.log('COMPILING DONE:', new Date().toLocaleTimeString());
	console.log(getLine());
	let times = [];
	let numberOfErrors = 0;
	let numberOfWarnings = 0;
	output.children.forEach(child => {
		// Render a separator between different apps
		if (times.length !== 0) {
			console.log(getLine('-'));
			console.log('');
		}

		// Render the asset list
		let time = child.time > 5000 ? Math.round(child.time / 100) / 10 + 's' : child.time + 'ms';
		times.push(time);
		console.log('APP-' + times.length + ' | Time: ' + time);
		console.log('Asset'.padStart(assetColLength, ' ') + '  ' + 'Size'.padStart(sizeColLength));
		let ignoredChunks = 0;
		let ignoredSize = 0;
		child.assets.forEach(asset => {
			// Ignore non main chunks and maps
			let useAsset = !asset.name.match(/\.map$/) &&
				(typeof asset.chunks[0] === 'string' && asset.chunks[0].indexOf('main') === 0);
			if(typeof asset.chunks[0] === 'number') useAsset = false;
			if (!useAsset) {
				ignoredChunks++;
				ignoredSize += asset.size;
				return;
			}
			let realAssetName = (child.outputPath + '/' + asset.name).replace(/[\\\/]/g, '/');
			console.log(
				colorGreen(realAssetName.substr(-(assetColLength - 5)).padStart(assetColLength)) + '  '
				+ humanFileSize(asset.size).padStart(sizeColLength));
		});
		if (ignoredChunks !== 0)
			console.log(('  + ' + ignoredChunks + ' hidden files (maps, chunks, assets, and so on)').padStart(assetColLength) + '  ' +
				humanFileSize(ignoredSize).padStart(sizeColLength));

		// Check if there are warnings
		if (child.warnings.length > 0) {
			numberOfWarnings += child.warnings.length;
			console.log(getLine('.'));
			console.log('');
			console.error(colorYellow('BEWARE! There are warnings!'));
			console.log('');
			child.warnings.forEach(entry => {
				let isBreak = false;
				entry.split(/\r?\n/).forEach(line => {
					if (isBreak || line.match(/\sproblems?\s\(.*?\serrors?,\s.*?\swarnings?\)/)) {
						isBreak = true;
						return;
					}
					console.log(colorYellow(line));
				});
			});
		}

		// Check if there are errors
		if (child.errors.length > 0) {
			numberOfErrors += child.errors.length;
			console.log(getLine('.'));
			console.log('');
			console.error(colorRed('MISTAKES HAVE BEEN MADE!'));
			console.log('');
			child.errors.forEach(entry => {
				let isBreak = false;
				entry.split(/\r?\n/).forEach(line => {
					if (isBreak || line.match(/\sproblems?\s\(.*?\serrors?,\s.*?\swarnings?\)/)) {
						isBreak = true;
						return;
					}
					console.log(colorRed(line));
				});
			});
		}
	});

	// Render a footer
	console.log(getLine());
	let state = numberOfWarnings === 0 && numberOfErrors === 0 ? colorGreen('OK') : '';
	if (numberOfWarnings > 0) state = colorYellow(numberOfWarnings + ' warning' + (numberOfWarnings === 1 ? '' : 's'));
	if (numberOfWarnings !== 0 && numberOfErrors !== 0) state += ' | ';
	if (numberOfErrors > 0) state += colorRed(numberOfErrors + ' error' + (numberOfErrors === 1 ? '' : 's'));
	console.log(new Date().toLocaleTimeString(), '| Time:', times.join(', '), ' |', state);

	process.exit();
	console.error(colorRed('ERRORS OCCURED:'));
	console.error(getLine());

	console.log(stats.toString({
		'colors': true,
		'assets': true,
		'warnings': true,
		'errorDetails': false,
	}));
};