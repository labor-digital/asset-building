/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const kill = require('../Helpers/kill');

/**
 * Adds a pseudo js file of no real entries where given, but our additional
 * scripts require webpack to run. With this pseudofile webpack has a valid entrypoint to compile and everybody is happy.
 * @param laborConfig
 * @param context
 */
function addPseudoJsEntryPoint(laborConfig, context) {
	let tmpInput = './node_modules/@labor/tmp/tmp-js.js';
	let tmpOutput = './node_modules/@labor/tmp/ignore-me.js';
	let realFile = context.dir.nodeModules + '@labor/tmp/tmp-js.js';
	if (!fs.existsSync(realFile)) {
		try {
			fs.mkdirSync(context.dir.nodeModules + '@labor/tmp');
		} catch (e) {
		}
		fs.writeFileSync(realFile, 'alert(\'hallo\');');
	}
	laborConfig.js = [
		{
			'entry': tmpInput,
			'output': tmpOutput
		}
	];
}

/**
 * This helper builds all css related configuration
 * @param webpackConfig
 * @param cssConfig
 * @param context
 */
function buildCssConfig(webpackConfig, cssConfig, context) {
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
}

/**
 * Prepares the copy configuration to match the copy plugin's syntax but is easier to write.
 * @see https://github.com/webpack-contrib/copy-webpack-plugin
 * @param webpackConfig
 * @param copyConfig
 * @param context
 */
function buildCopyConfig(webpackConfig, copyConfig, context) {
	// Add the context to all configurations
	copyConfig.forEach(config => {

		// Validate input
		if (typeof config.from === 'undefined') kill('Your copy configuration does not define a "from" key!');
		if (typeof config.to === 'undefined') kill('Your copy configuration does not define a "to" key!');

		// Add context if required
		if (typeof config.context === 'undefined') config.context = context.dir.current;

		// Check if we have to rewrite the "from" -> Array to string
		if (Array.isArray(config.from)) {
			var thisValue = config.from.shift();
			var jsonConfig = JSON.stringify(config);
			config.from.forEach(v => {
				var newConfig = JSON.parse(jsonConfig);
				newConfig.from = v;
				copyConfig.push(newConfig);
			});
			config.from = thisValue;
		}
	});

	// Make sure we can resolve node modules
	copyConfig.forEach(config => {
		// Remove all glob related stuff from the path
		let fromDirectory = path.dirname(config.from.replace(/\*.*?$/, ''));
		let fromPrefix = '';
		if (fromDirectory.length > 0 && !fs.existsSync(fromDirectory)) {
			for (let directory of [context.dir.nodeModules, context.dir.buildingNodeModules, context.dir.current]) {
				fromPrefix = directory;
				if(fs.existsSync(fromPrefix + fromDirectory)) break;
				fromPrefix = '';
			}
			config.from = fromPrefix + config.from;
		}
	});

	// Add copy plugin
	webpackConfig.plugins.push(new CopyWebpackPlugin(copyConfig));

}

/**
 * Prepares the js configuration for the webpack worker
 *
 * @param webpackConfig
 * @param jsConfig
 * @param context
 */
function buildJsConfig(webpackConfig, jsConfig, context) {
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
	var eslintOptions = {
		'env': {'browser': true},
		'ecmaFeatures': {'jsx': true},
		'globals': [
			'document:true', 'console:true', 'window:true', 'setTimeout:true', 'setInterval:true', 'clearTimeout:true',
			'clearInterval:true', 'define:true', 'jQuery:true', 'location:true', 'makeDiv:true',
			'module:true', 'exports:true', 'localStorage:true', 'alert:true', 'navigator:true', 'screen:true',
			'event:true', 'DOMParser:true', 'ActiveXObject:true', 'Symbol:true', 'prefixes:true',
			'enableClasses:true', 'Image:true', 'require:true', 'HTMLElement:true', 'history:true', 'Int8Array:true'
		],
		'rules': {
			'comma-dangle': [2, 'never'],
			'no-undef': 2,
			'max-len': 'off'
		}
	};

	// Production eslint options
	if (context.isProd) {
		eslintOptions.rules = {
			'no-dupe-args': 2, 'no-duplicate-case': 2, 'no-template-curly-in-string': 2,
			'no-unexpected-multiline': 2, 'no-unsafe-finally': 2, 'no-unsafe-negation': 2,
			'comma-dangle': [2, 'never'], 'no-constant-condition': 2,
			'no-control-regex': 2, 'no-debugger': 2, 'no-dupe-keys': 2, 'no-empty-character-class': 2,
			'no-ex-assign': 2, 'no-extra-boolean-cast': 2, 'no-extra-parens': 0, 'no-extra-semi': 1,
			'no-func-assign': 2, 'no-inner-declarations': 1, 'no-invalid-regexp': 2, 'no-irregular-whitespace': 2,
			'no-negated-in-lhs': 2, 'no-obj-calls': 2, 'no-regex-spaces': 2, 'no-reserved-keys': 0,
			'no-sparse-arrays': 2, 'no-unreachable': 2, 'use-isnan': 2, 'valid-jsdoc': 0, 'valid-typeof': 2,
			'no-undef': 2
		};
	}

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

function buildJsCompatConfig(webpackConfig, jsCompatConfig, context) {
	// Register import loader rules
	jsCompatConfig.forEach((config, k) => {
		// Validate
		if (typeof config !== 'object') kill('Invalid js compat configuration at key: ' + k);
		if (typeof config.rule !== 'string' || config.rule.trim().length === 0)
			kill('Invalid or missing js compat "rule" at key: ' + k);
		if (typeof config.fix !== 'string' || config.fix.trim().length === 0)
			kill('Invalid or missing js compat "fix" at key: ' + k);

		// Add imports loader if fix misses it
		if (config.fix.indexOf('imports-loader?') !== 0) config.fix = 'imports-loader?' + config.fix;

		// Add new module
		webpackConfig.module.rules.push({
			'test': new RegExp(config.rule),
			'loader': config.fix
		})
	});
}

/**
 * Builds a valid webpack config based of the labor configuration syntax
 * @param {module.ConfigBuilderContext} context
 * @returns {*}
 */
module.exports = function (context) {

	// Prepare config
	context.webpackConfig = Object.assign(context.webpackConfig, {
		'entry': {},
		'devtool': '',
		'optimization': {
			'minimize': false
		},
		'performance': {
			'hints': false
		},
		'output': {
			'path': dir.current,
			'filename': './[name]'
		}
	});

	// Make sure we have stuff to watch
	let hasCss = typeof context.laborConfig.css !== 'undefined' && Array.isArray(context.laborConfig.css) && context.laborConfig.css.length > 0;
	let hasJs = typeof context.laborConfig.js !== 'undefined' && Array.isArray(context.laborConfig.js) && context.laborConfig.js.length > 0;
	if (!hasCss && !hasJs) {
		console.log('Adding pseudo js file to make sure webpack works without crashing...');
		addPseudoJsEntryPoint(context.laborConfig, context);
		hasJs = true;
	}

	// Apply given configuration
	// CSS
	if (hasCss)
		buildCssConfig(context.webpackConfig, context.laborConfig.css, context);
	// COPY
	if (typeof context.laborConfig.copy !== 'undefined' && Array.isArray(context.laborConfig.copy) && context.laborConfig.copy.length > 0)
		buildCopyConfig(context.webpackConfig, context.laborConfig.copy, context);
	// JS
	if (hasJs)
		buildJsConfig(context.webpackConfig, context.laborConfig.js, context);
	// JS COMPAT (Imports loader)
	if (typeof context.laborConfig.jsCompat !== 'undefined' && Array.isArray(context.laborConfig.jsCompat) && context.laborConfig.jsCompat.length > 0)
		buildJsCompatConfig(context.webpackConfig, context.laborConfig.jsCompat, context);

	// Make sure webpack generates a source map even if in dev mode
	context.webpackConfig.plugins.push(
		new webpack.SourceMapDevToolPlugin({
			filename: "[file].map"
		}),
	);

	// Make sure the emitted css files don't interfere with each other
	context.webpackConfig.plugins.push({
		'apply': function (compiler) {
			let realWrite = compiler.outputFileSystem.writeFile;
			compiler.outputFileSystem.writeFile = function (path, data, callback) {
				if (typeof path === 'string' && path.indexOf('.css') !== -1) {
					// Drop ignored files
					if (path.match(/\.drop$|\.drop\.map$/)) {
						callback(null);
						return;
					}
					// Rewrite drop css
					if (path.indexOf('.drop.css') !== -1)
						path = path.replace(/\.drop\.css/, '');
					// Rewrite in data
					data = data.toString();
					data = data.replace(/\.drop\.css/g, '');
				}
				realWrite(path, data, callback);
			}
		}
	});

	// Done
	return context;
};