/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const kill = require('../../Helpers/kill');

/**
 * This helper builds all css related configuration
 * @param webpackConfig
 * @param cssConfig
 * @param context
 */
module.exports = function buildCssConfig(webpackConfig, cssConfig, context) {
	// Register entry points
	cssConfig.forEach((config, k) => {
		// Validate
		if (typeof config !== 'object') kill('Invalid css configuration at key: ' + k);
		if (typeof config.entry !== 'string' || config.entry.trim().length === 0)
			kill('Invalid or missing css "entry" at key: ' + k);
		if (typeof config.output !== 'string' || config.output.trim().length === 0)
			kill('Invalid or missing css "output" at key: ' + k);

		let entryFile = './' + path.relative(context.dir.current, path.resolve(context.dir.current, config.entry)).replace(/\\/g, '/');
		let outputFile = path.relative(context.dir.current, path.resolve(context.dir.current, config.output + '.drop')).replace(/\\/g, '/');
		webpackConfig.entry[outputFile] = entryFile;
	});

	// Register extractor plugin
	webpackConfig.plugins.push(new MiniCssExtractPlugin({'filename': '[name].css'}));

	// Prepare optimizers
	if (webpackConfig.optimization.minimizer === undefined)
		webpackConfig.optimization.minimizer = [];

	// Register css minifier when in prod
	if (context.isProd) webpackConfig.optimization.minimizer.push(new OptimizeCssAssetsPlugin({
		'cssProcessorOptions': {'map': {'inline': false}}
	}));

	// Register loaders
	webpackConfig.module.rules.push({
		'test': /\.s[c|a]ss$/,
		'use': [
			MiniCssExtractPlugin.loader,
			{
				'loader': 'css-loader?url=false&-url',
				'options': {
					'url': false,
					'sourceMap': true
				}
			}, {
				'loader': 'sass-loader?sourceMapRoot=foo',
				'options': {
					'sourceMap': true,
					'outputStyle': 'expanded',
					'sourceMapContents': true
				}
			}
		]
	});
	webpackConfig.module.rules.push({
		'test': /\.less$/,
		'use': [
			MiniCssExtractPlugin.loader,
			{
				'loader': 'css-loader?url=false&-url',
				'options': {
					'url': false,
					'sourceMap': true
				}
			}, {
				'loader': 'less-loader',
				'options': {
					'relativeUrls': false,
					'sourceMap': true
				}
			}
		]
	});
	webpackConfig.module.rules.push({
		'test': /\.css$/,
		'use': [
			MiniCssExtractPlugin.loader,
			{
				'loader': 'css-loader?url=false&-url',
				'options': {
					'url': false,
					'sourceMap': true
				}
			}
		]
	});
};