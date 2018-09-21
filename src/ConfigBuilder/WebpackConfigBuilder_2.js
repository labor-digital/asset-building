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
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackPromiseShimPlugin = require('../WebpackPlugins/WebpackPromiseShimPlugin');
const WebpackFixBrokenChunkPlugin = require('../WebpackPlugins/WebpackFixBrokenChunkPlugin');
const buildCopyConfig = require('./Parts/buildCopyConfig');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const addEsLintConfig = require('./Parts/addEsLintConfig');
const addJsAndTsUtilityLoaders = require('./Parts/addJsAndTsUtilityLoaders');
const resolveFilenameFix = require('./Parts/resolveFilenameFix');
const addTypescriptLoader = require('./Parts/addTypescriptLoader');

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
		context.currentApp = i;
		let app = laborConfig.apps[i];

		// Add the relative entry point
		if (typeof app.entry !== 'string' || app.entry.trim() === '')
			kill('Your app: "' + i + '" misses an "entry" point node!');
		context.webpackConfig.entry = '.' + path.sep + path.relative(context.dir.current, path.resolve(context.dir.current, app.entry));
		const inputDirectory = path.dirname(app.entry);

		// Add output definition
		if (typeof app.output !== 'string' || app.output.trim() === '')
			kill('Your app: "' + i + '" misses an "output" node!');
		let outputDirectory = path.resolve(context.dir.current, app.output);
		let outputFile = path.basename(outputDirectory);
		let outputFileWithoutExtension = outputFile.replace(/\..*$/, '');
		outputDirectory = path.dirname(outputDirectory);
		context.webpackConfig = Object.assign({'output': {}}, context.webpackConfig);
		context.webpackConfig.output.path = outputDirectory;
		context.webpackConfig.output.filename = outputFile;
		context.webpackConfig.output.chunkFilename = 'js/' + outputFileWithoutExtension + '-[id].js';

		// Add public path if given
		if (typeof app.publicPath === 'string' && app.publicPath.trim() !== '')
			context.webpackConfig.output.publicPath = app.publicPath;
		if (context.isProd === false && typeof app.publicPathDev === 'string' && app.publicPathDev.trim() !== '')
			context.webpackConfig.output.publicPath = app.publicPathDev;

		// Set devtool based on context
		context.webpackConfig.devtool = context.isProd ? 'source-map' : 'cheap-module-eval-source-map';

		// Add loaders to do the main magic
		context.webpackConfig = merge({'module': {'rules': []}}, context.webpackConfig);

		// Html loader
		context.webpackConfig.module.rules.push({
			'test': /\.html$/,
			'use': [{
				loader: 'html-loader'
			}],
		});

		// Typescript compiler
		addTypescriptLoader(context, app.useTypeChecker === true);

		// Add utility loaders
		let additionalPolyfills = Array.isArray(app.polyfills) ? app.polyfills : [];
		addJsAndTsUtilityLoaders(path.resolve(context.dir.current, app.entry), context, true, additionalPolyfills);

		// Eslint
		addEsLintConfig(context);

		// Add plugins to do the additional magic
		context.webpackConfig = merge({'plugins': []}, context.webpackConfig);

		// Register the provider plugin
		context.webpackConfig.plugins.push(
			new webpack.ProvidePlugin(
				context.callPluginMethod('getJsProvides', [{}, context])));

		// Less loader
		context.webpackConfig.module.rules.push({
			'test': /\.less$/,
			'use': [
				{
					'loader': MiniCssExtractPlugin.loader,
					'options': {
						'publicPath': '../'
					}
				},
				{
					'loader': 'css-loader',
					'options': {
						'import': false,
					}
				}, {
					'loader': 'less-loader'
				}
			]
		});

		// Sass and css loader
		// We route the css over the sass parser, because our internal script will take care of
		// any urls which could otherwise not be resolved correctly
		context.webpackConfig.module.rules.push({
			'test': /\.s?[ac]ss$/,
			'use': [
				{
					'loader': MiniCssExtractPlugin.loader,
					'options': {
						'publicPath': '../'
					}
				},
				{
					'loader': 'css-loader',
					'options': {
						'import': false,
					}
				},
				{
					'loader': path.resolve(context.dir.controller, './WebpackLoaders/CustomSassLoader.js'),
					'options': {
						'app': context.laborConfig.apps[context.currentApp],
						'dir': context.dir,
						'useCssLoaderBridge': true
					}
				}
			]
		});

		// Hack to speed up the css-loader compilation
		require('../Helpers/CssLoaderProcessCssWrapper');

		// Image loader
		context.webpackConfig.module.rules.push({
			test: /\.(png|gif|jpe?g|svg)$/,
			use: [
				{
					loader: 'url-loader',
					options: {
						'name': '[name].[ext]',
						'outputPath': 'images/',
						'limit': context.isProd ? 10000 : 1,
						'fallback': {
							'loader': 'file-loader',
							'options': {
								'name': '[name].[ext]?[hash]'
							}
						}
					}
				},
				{
					loader: 'image-webpack-loader',
					options: {
						disable: !context.isProd || app.imageCompression === false
					},
				},
			]
		});

		// Font loader
		context.webpackConfig.module.rules.push({
			test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
			use: [
				{
					loader: 'file-loader',
					options: {
						'name': '[name].[ext]?[hash]',
						'outputPath': 'fonts/'
					}
				}
			]
		});

		// This plugin prevents Webpack from creating chunks
		// that would be too small to be worth loading separately
		if (app.minChunkSize !== 0) {
			context.webpackConfig.plugins.push(
				new webpack.optimize.MinChunkSizePlugin({
					minChunkSize: typeof app.minChunkSize === 'undefined' ? 10000 : app.minChunkSize
				})
			);
		}

		// Add plugin to clean the output directory when the app is compiled
		// But make sure to keep all sources which have been defined in there
		const sourceToExclude = path.relative(outputDirectory, inputDirectory).split(/\\\//).shift();
		const cleanConfig = context.callPluginMethod('filterCleanOptions', [
			{
				'directories': [path.basename(outputDirectory)],
				'options': {
					'root': path.dirname(outputDirectory),
					'exclude': sourceToExclude.length > 0 ? [sourceToExclude, sourceToExclude + '/'] : undefined,
					'verbose': true,
				}
			}, context
		]);
		context.webpackConfig.plugins.push(new CleanWebpackPlugin(cleanConfig.directories, cleanConfig.options));

		// Add plugin to extract the css of all NON-dynamic chunks
		context.webpackConfig.plugins.push(new MiniCssExtractPlugin({
			'filename': 'css/' + outputFileWithoutExtension + '.css',
			'chunkFilename': 'css/' + outputFileWithoutExtension + '-[id].css'
		}));

		// Add our custom plugins
		context.webpackConfig.plugins.push(new WebpackPromiseShimPlugin());
		context.webpackConfig.plugins.push(new WebpackFixBrokenChunkPlugin());
		context.webpackConfig.plugins.push(new ProgressBarPlugin());

		// Special optimization when in dev mode
		if (!context.isProd) {
			context.webpackConfig = merge({'output': {'pathinfo': false}, 'optimization': {}}, context.webpackConfig);
			context.webpackConfig.optimization.removeAvailableModules = false;
			context.webpackConfig.optimization.removeEmptyChunks = false;
			context.webpackConfig.optimization.splitChunks = false;
		}

		// Plugins for production usage
		if (context.isProd) {
			context.webpackConfig = merge({'optimization': {'minimize': true, 'minimizer': []}}, context.webpackConfig);

			// Enable minification
			context.webpackConfig.optimization.minimize = true;

			// Register JS uglifier
			context.webpackConfig.optimization.minimizer.push(new UglifyJsPlugin({
				'cache': true,
				'parallel': true,
				'sourceMap': true,
				'extractComments': true,
				'uglifyOptions': {
					'mangle': true,
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

		// Add given copy configuration
		if (typeof context.laborConfig.copy !== 'undefined' && Array.isArray(context.laborConfig.copy) && context.laborConfig.copy.length > 0)
			buildCopyConfig(context.webpackConfig, context.laborConfig.copy, context);

		// Call filters
		context.callPluginMethod('filter', [context.webpackConfig, context]);

		// Add the output to the real webpack config
		webpackConfigReal.push(context.webpackConfig);
	}

	// Inject real webpack config into context
	context.webpackConfig = webpackConfigReal;

	// Apply resolve filename fix
	resolveFilenameFix(context.dir);

	// Done
	return context;
};