/**
 * Created by Martin Neundorfer on 06.09.2018.
 * For LABOR.digital
 */
const path = require('path');
const webpack = require('webpack');
const kill = require('../Helpers/kill');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');
const EsLintConfig_2 = require('../EsLintConfig/EsLintConfig_2');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackPromiseShimPlugin = require('../WebpackPlugins/WebpackPromiseShimPlugin');
const WebpackFixBrokenChunkPlugin = require('../WebpackPlugins/WebpackFixBrokenChunkPlugin');

/**
 * @param {module.ConfigBuilderContext} context
 */
module.exports = function WebpackConfigBuilder_2(context) {

	let laborConfig = context.laborConfig;
	if (typeof laborConfig.apps === 'undefined') kill('Missing the "apps" node in your labor config!');

	// Create copies of the webpack config for every app we got
	let webpackConfigReal = [];
	let rawWebpackConfig = JSON.stringify(context.webpackConfig);
	for (let i = 0; i < laborConfig.apps.length; i++) {
		// Create local instance for the current app
		context.webpackConfig = JSON.parse(rawWebpackConfig);
		let app = laborConfig.apps[i];

		// Add the relative entry point
		if (typeof app.entry !== 'string' || app.entry.trim() === '')
			kill('Your app: "' + i + '" misses an "entry" point node!');
		context.webpackConfig.entry = '.' + path.sep + path.relative(context.dir.current, path.resolve(context.dir.current, app.entry));

		// Add output definition
		if (typeof app.output !== 'string' || app.output.trim() === '')
			kill('Your app: "' + i + '" misses an "output" node!');
		let outputDirectory = path.resolve(context.dir.current, app.output);
		let outputFile = path.basename(outputDirectory);
		let outputFileWithoutExtension = outputFile.replace(/\..*$/, '');
		outputDirectory = path.dirname(outputDirectory);
		context.webpackConfig = Object.assign({'output': {}}, context.webpackConfig);
		context.webpackConfig.output.path = outputDirectory;
		context.webpackConfig.output.filename = 'js/' + outputFile;
		context.webpackConfig.output.chunkFilename = 'js/' + outputFileWithoutExtension + '-[id].[hash].js';

		// Add public path if given
		if (typeof app.publicPath === 'string' && app.publicPath.trim() !== '')
			context.webpackConfig.output.publicPath = app.publicPath;
		if (context.isProd === false && typeof app.publicPathDev === 'string' && app.publicPathDev.trim() !== '')
			context.webpackConfig.output.publicPath = app.publicPathDev;

		// Set devtool based on context
		context.webpackConfig.devtool = 'source-map';

		// Add loaders to do the main magic
		context.webpackConfig = merge({'module': {'rules': []}}, context.webpackConfig);

		// Handle modules which are allowed to be compiled as es6
		let allowedModules = ['@labor'];
		if (typeof app.allowedModules !== 'undefined' && Array.isArray(app.allowedModules)) {
			app.allowedModules.forEach(v => {
				// Remove all slashes at the front and the back && Make paths ready for regex
				v = v.replace(/^[\\\/]|[\\\/]$/g, '').replace(/[\\\/]/g, '[\\\\\\/]');
				if (allowedModules.indexOf(v) === -1) allowedModules.push(v);
			});
		}
		let jsExclude = 'node_modules(?![\\/\\\\]' + allowedModules.join('[\\/\\\\]|[\\/\\\\]') + '[\\/\\\\])';

		// Babel loader
		context.webpackConfig.module.rules.push({
			'test': /\.js$/,
			'exclude': new RegExp(jsExclude),
			'use': [
				{
					'loader': 'babel-loader',
					'options': context.callPluginMethod('filterBabelOptions', [{
						'compact': false,
						'presets': [require('babel-preset-env'), require('babel-preset-es3')],
						"plugins": [require('babel-plugin-transform-runtime'), require('babel-plugin-syntax-dynamic-import')]
					}, context])
				}
			]
		});

		// Eslint loader && Require related
		context.webpackConfig.module.rules.push({
			'test': /\.js$/,
			'enforce': 'pre',
			'exclude': new RegExp(jsExclude),
			'use': [
				{
					'loader': path.resolve(context.dir.controller, './WebpackLoaders/RequireRelatedLoader.js')
				},
				{
					'loader': 'eslint-loader',
					'options': context.callPluginMethod('filterEslintOptions', [
						new EsLintConfig_2(context.isProd), context])
				}
			]
		});

		// Html loader
		context.webpackConfig.module.rules.push({
			test: /\.html$/,
			use: [{
				loader: 'html-loader'
			}],
		});

		// Css loader
		context.webpackConfig.module.rules.push({
			test: /\.css$/,
			use: [
				{
					'loader': MiniCssExtractPlugin.loader,
					'options': {
						'publicPath': '../'
					}
				},
				{
					'loader': 'css-loader',
					'options': {
						'sourceMap': true
					}
				}
			]
		});

		// Sass loader
		context.webpackConfig.module.rules.push({
			test: /\.s[ac]ss$/,
			use: [
				{
					'loader': MiniCssExtractPlugin.loader,
					'options': {
						'publicPath': '../'
					}
				},
				{
					'loader': 'css-loader',
					'options': {
						'sourceMap': true
					}
				},
				{
					'loader': 'sass-loader',
					'options': {
						'sourceMap': true,
						'outputStyle': 'expanded',
						'sourceMapContents': true
					}
				},
			]
		});

		// Less loader
		context.webpackConfig.module.rules.push({
			test: /\.less$/,
			use: [
				{
					'loader': MiniCssExtractPlugin.loader,
					'options': {
						'publicPath': '../'
					}
				},
				{
					'loader': 'css-loader',
					'options': {
						'sourceMap': true
					}
				},
				{
					'loader': 'less-loader',
					'options': {
						'sourceMap': true
					}
				},
			]
		});

		// Image loader
		context.webpackConfig.module.rules.push({
			test: /\.(png|gif|jpe?g|svg)$/,
			use: [
				{
					loader: 'url-loader',
					options: {
						'name': '[name].[ext]',
						'outputPath': 'images/',
						'limit': 10000
					}
				}
			]
		});

		// Font loader
		context.webpackConfig.module.rules.push({
			test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
			use: [
				{
					loader: 'file-loader',
					options: {
						'name': '[name].[ext]',
						'outputPath': 'fonts/'
					}
				}
			]
		});

		// Add plugins to do the additional magic
		context.webpackConfig = merge({'plugins': []}, context.webpackConfig);

		// Register the provider plugin
		context.webpackConfig.plugins.push(
			new webpack.ProvidePlugin(
				context.callPluginMethod('getJsProvides', [{
				}, context])));

		// This plugin prevents Webpack from creating chunks
		// that would be too small to be worth loading separately
		context.webpackConfig.plugins.push(
			new webpack.optimize.MinChunkSizePlugin({
				minChunkSize: 10000 // ~10kb
			})
		);

		// Add plugin to clean the output directory when the app is compiled
		context.webpackConfig.plugins.push(new CleanWebpackPlugin(path.basename(outputDirectory), {
			'root': path.dirname(outputDirectory)
		}));

		// Add plugin to extract the css of all NON-dynamic chunks
		context.webpackConfig.plugins.push(new MiniCssExtractPlugin({
			'filename': 'css/' + outputFileWithoutExtension + '.css',
			'chunkFilename': 'css/' + outputFileWithoutExtension + '-[id].[hash].css'
		}));

		// Add our custom plugins
		context.webpackConfig.plugins.push(new WebpackPromiseShimPlugin());
		context.webpackConfig.plugins.push(new WebpackFixBrokenChunkPlugin());

		// Plugins for production usage
		if (context.isProd) {

			// Enable minification
			context.webpackConfig.optimization.minimize = true;

			// Register JS uglifier
			context.webpackConfig.optimization.minimizer.push(new UglifyJsPlugin({
				'mangle': true,
				'sourceMap': true,
				'extractComments': true,
				'uglifyOptions': {
					'ecma': 5,
					'toplevel': true
				}
			}));

			// Register CSS uglifier
			context.webpackConfig.optimization.minimizer.push(new OptimizeCssAssetsPlugin({
				'cssProcessorOptions': {
					'map': {
						'inline': false,
						'annotation': true
					}
				}
			}))
		}

		// Apply given, additional configuration
		if (typeof app.config === 'object')
			context.webpackConfig = merge(context.webpackConfig, app.config);

		// Call filters
		context.callPluginMethod('filter', [context.webpackConfig, context]);

		// Add the output to the real webpack config
		webpackConfigReal.push(context.webpackConfig);
	}

	// Inject real webpack config into context
	context.webpackConfig = webpackConfigReal;

	// Done
	return context;
};