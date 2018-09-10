/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const EsLintConfig_1 = require('../../EsLintConfig/EsLintConfig_1');
const path = require('path');
const kill = require('../../Helpers/kill');
const webpack = require('webpack');

/**
 * Prepares the js configuration for the webpack worker
 *
 * @param webpackConfig
 * @param jsConfig
 * @param context
 */
module.exports = function buildJsConfig(webpackConfig, jsConfig, context) {
	// Check if babel should be used for any of our js configs
	var useBabel = false;

	// Store all node-modules which are allowed for babel compiling
	let allowedModules = ['@labor'];

	// Register entry points
	jsConfig.forEach((config, k) => {
		// Validate
		if (typeof config !== 'object') kill('Invalid js configuration at key: ' + k);
		if (typeof config.entry !== 'string' || config.entry.trim().length === 0)
			kill('Invalid or missing js "entry" at key: ' + k);
		if (typeof config.output !== 'string' || config.output.trim().length === 0)
			kill('Invalid or missing js "output" at key: ' + k);

		// Store allowed babel modules
		if (typeof config.allowedModules !== 'undefined' && Array.isArray(config.allowedModules)) {
			config.allowedModules.forEach(v => {
				if (allowedModules.indexOf(v) !== -1) return;
				v = v
				// Remove all slashes at the front and the back
					.replace(/^[\\\/]|[\\\/]$/g, '')
					// Make paths ready for regex
					.replace(/[\\\/]/g, '[\\\\\\/]');
				allowedModules.push(v);
			});
		}

		let entryFile = './' + path.relative(context.dir.current, path.resolve(context.dir.current, config.entry)).replace(/\\/g, '/');
		let outputFile = path.relative(context.dir.current, path.resolve(context.dir.current, config.output)).replace(/\\/g, '/');
		webpackConfig.entry[outputFile] = entryFile;

		// Check if we have to use babel
		useBabel = useBabel || !(config.babel === false);
	});

	// Default eslint options
	var eslintOptions = new EsLintConfig_1(context.isProd);

	// Define default loaders
	var jsLoaders = [
		{
			'loader': 'eslint-loader',
			'options': context.callPluginMethod('filterEslintOptions', [eslintOptions, context])
		}
	];

	// Add babel loader if required
	if (useBabel) {

		// Add babel itself
		jsLoaders.push({
			'loader': 'babel-loader',
			'options': context.callPluginMethod('filterBabelOptions', [{
				'compact': false,
				'presets': [require('babel-preset-env'), require('babel-preset-es3')],
				"plugins": [require('babel-plugin-transform-runtime')]
			}, context])
		});
	}

	// Build exclude
	let jsExclude = 'node_modules(?![\\/\\\\]' + allowedModules.join('[\\/\\\\]|[\\/\\\\]') + '[\\/\\\\])';
	jsExclude = new RegExp(jsExclude);

	// Register js modules
	webpackConfig.module.rules.push({
		test: /\.js$/,
		// Prevent babel babel compiling itself
		exclude: jsExclude,
		use: jsLoaders
	});

	// Check if there are provided elements
	var provided = context.callPluginMethod('getJsProvides', [{}, context]);
	if (provided !== {}) {
		webpackConfig.plugins.push(new webpack.ProvidePlugin(provided))
	}

	// Add uglifier if required
	if (context.isProd) {
		webpackConfig.optimization.minimize = true;
		webpackConfig.optimization.minimizer = [
			new UglifyJsPlugin({
				'sourceMap': true,
				'extractComments': true,
				'uglifyOptions': {
					'ecma': 5,
					'toplevel': true
				}
			})
		];
	}
}