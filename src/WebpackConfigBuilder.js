/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
var path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveDuplicateFileOutputPlugin = require('./RemoveDuplicateFileOutputPlugin');
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const LastCallWebpackPlugin = require('last-call-webpack-plugin');

function kill(msg) {
	console.error(msg);
	process.exit();
}

function buildCssConfig(webpackConfig, cssConfig, isProd, dir) {

	// Register entry points
	cssConfig.forEach((config, k) => {
		// Validate
		if (typeof config !== 'object') kill('Invalid css configuration at key: ' + k);
		if (typeof config.entry !== 'string' || config.entry.trim().length === 0)
			kill('Invalid or missing css "entry" at key: ' + k);
		if (typeof config.output !== 'string' || config.output.trim().length === 0)
			kill('Invalid or missing css "output" at key: ' + k);

		// Add entry
		var relativeOut = path.relative(dir.current, path.resolve(dir.current, config.output))
			.replace(/\\/g, '/');
		var relativeIn = './' + path.relative(dir.current, path.resolve(dir.current, config.entry))
			.replace(/\\/g, '/');
		webpackConfig.entry[relativeOut] = relativeIn;
	});

	// Register extractor plugin
	webpackConfig.plugins.push(new MiniCssExtractPlugin({'filename': '[name].pseudo.css'}));

	// Prepare optimizers
	if (webpackConfig.optimization.minimizer === undefined)
		webpackConfig.optimization.minimizer = [];

	// Remove pseudo bundles created by extracted files and inject content into the output asset
	var processed = [];
	var processor = function (assetName, asset, assets) {
		if(processed.indexOf(assetName) === -1){
			processed.push(assetName);
			console.log(assetName);
			var realAssetname = './' + assetName.replace(/^\.+\//, '').replace(/\.pseudo\.css/, '');
			assets.setAsset(realAssetname, asset.source());
			assets.setAsset(assetName, null);
		}
		return new Promise(function (resolve) {
			resolve(undefined);
		});
	};
	webpackConfig.optimization.minimizer.push(new LastCallWebpackPlugin({
		'assetProcessors': [
			{
				'regExp': /\.pseudo\.css/,
				'phase': LastCallWebpackPlugin.PHASES.OPTIMIZE_CHUNK_ASSETS,
				'processor': processor
			},
			{
				'regExp': /\.pseudo\.css/,
				'phase': LastCallWebpackPlugin.PHASES.EMIT,
				'processor': processor
			}
		]
	}));

	// Register css minifier when in prod
	if (isProd) webpackConfig.optimization.minimizer.push(new OptimizeCssAssetsPlugin({
		'cssProcessorOptions': { 'map': { 'inline': false } }
	}));

	// Register loaders
	webpackConfig.module.rules.push({
		'test': /\.css$/,
		'use': [
			MiniCssExtractPlugin.loader,
			{
				loader: "css-loader",
				options: {
					sourceMap: true
				}
			}
		]
	});
	webpackConfig.module.rules.push({
		'test': /\.s[c|a]ss$/,
		'use': [
			MiniCssExtractPlugin.loader,
			{
				loader: "css-loader",
				options: {
					sourceMap: true
				}
			}, {
				loader: "sass-loader",
				options: {
					sourceMap: true
				}
			}
		]
	});
}

module.exports = function WebpackConfigBuilder(dir, laborConfig, mode) {
	// Validate mode
	var validModes = ['build', 'watch'];
	if (validModes.indexOf(mode) === -1)
		kill('Invalid mode given: "' + mode + '", valid modes are: "' + validModes.join(', ') + '"!');

	// Determin if this is production or not
	var isProd = mode === 'build';

	// Prepare config
	var webpackConfig = {
		'entry': {},
		'devtool': 'source-map',
		'optimization': {},
		'output': {
			'path': dir.current,
			'filename': './[name]'
		},
		'plugins': [],
		'module': {
			'rules': []
		}
	};

	// Apply given configuration
	if (typeof laborConfig.css !== 'undefined' && Array.isArray(laborConfig.css) && laborConfig.css.length > 0)
		buildCssConfig(webpackConfig, laborConfig.css, isProd, dir);

	// Determine mode specifics
	switch (mode) {
		case "build":

			break;
		case "watch":
			// Enable filewatcher
			webpackConfig.watch = true;
			break;
	}
	console.log(webpackConfig);

	return webpackConfig;
};