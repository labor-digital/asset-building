/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const kill = require('../../Helpers/kill');
const webpack = require('webpack');
const addEsLintConfig = require('./addEsLintConfig');
const addJsAndTsUtilityLoaders = require('./addJsAndTsUtilityLoaders');
const FileHelpers = require('../../Helpers/FileHelpers');
const addTypescriptLoader = require('./addTypescriptLoader');

/**
 * Prepares the js configuration for the webpack worker
 *
 * @param webpackConfig
 * @param jsConfig
 * @param context
 */
module.exports = function buildJsConfig(webpackConfig, jsConfig, context) {
	// Prepare configuration
	let useTypechecker = false;
	let additionalPolyfills = [];

	// Register entry points
	jsConfig.forEach((config, k) => {
		// Validate
		if (typeof config !== 'object') kill('Invalid js configuration at key: ' + k);
		if (typeof config.entry !== 'string' || config.entry.trim().length === 0)
			kill('Invalid or missing js "entry" at key: ' + k);
		if (typeof config.output !== 'string' || config.output.trim().length === 0)
			kill('Invalid or missing js "output" at key: ' + k);

		let entryFile = './' + path.relative(context.dir.current, path.resolve(context.dir.current, config.entry)).replace(/\\/g, '/');
		let outputFile = path.relative(context.dir.current, path.resolve(context.dir.current, config.output)).replace(/\\/g, '/');
		webpackConfig.entry[outputFile] = entryFile;

		useTypechecker = useTypechecker || config.useTypeChecker === true;
		if(Array.isArray(config.polyfills)) additionalPolyfills.concat(config.polyfills);
	});

	// Prepare jsExclude
	const jsExclude = /node_modules(?![\\/\\\\]@labor[\\/\\\\])/;

	// Add typescript loader
	addTypescriptLoader(context, useTypechecker, jsExclude);

	// Add utility loaders
	let entryFiles = Object.entries(webpackConfig.entry)
		.map(v => path.resolve(context.dir.current, v[1])).filter(file =>
			['js','ts','tsx'].indexOf(FileHelpers.getFileExtension(file)) !== -1);
	addJsAndTsUtilityLoaders(entryFiles, context, false, additionalPolyfills, jsExclude);

	// Eslint
	addEsLintConfig(context, jsExclude);

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
};