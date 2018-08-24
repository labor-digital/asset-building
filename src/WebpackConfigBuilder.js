/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const LastCallWebpackPlugin = require('last-call-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

/**
 * Internal helper to show an error and stop the process
 * @param msg
 */
function kill(msg) {
	console.error(msg);
	process.exit();
}

/**
 * Internal helper to loop over all plugin instances and call a requested method on them.
 * The given arguments should be an array. If the method returns a value args[0] will automatically
 * be reset to the result. With that it is possible to pass a value through all plugin instances to filter it.
 *
 * @param {Array} plugins
 * @param {string} method
 * @param {Array} args
 * @returns {null}
 */
function callPluginMethod(plugins, method, args) {
	plugins.forEach(plugin => {
		if (typeof plugin[method] !== 'function') return;
		var result = plugin[method].apply(plugin, args);
		if (typeof result !== 'undefined') args[0] = result;
	});
	return typeof args[0] !== 'undefined' ? args[0] : null;
}

/**
 * Adds a pseudo js file of no real entries where given, but our additional
 * scripts require webpack to run. With this pseudofile webpack has a valid entrypoint to compile and everybody is happy.
 * @param laborConfig
 * @param context
 */
function addPseudoJsEntryPoint(laborConfig, context) {
	let tmpPath = path.relative(context.dir.current, path.resolve(require('os').tmpdir()) + path.sep) + path.sep;
	let tmpInput = tmpPath + 'pseudo-js.js';
	let tmpOutput = tmpPath + 'pseudo-bundle.js';
	require('fs').writeFileSync(tmpInput, 'alert(\'hallo\');');
	laborConfig.js = [
		{
			'entry': tmpInput,
			'babel': false,
			'output': tmpOutput,
			'absolutePaths': true
		}
	]
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

		// Handle absolute paths
		if (config['absolutePaths'] === true) {
			webpackConfig.entry[config.output] = config.entry;
		} else {
			// Add entry normally
			var relativeOut = path.relative(context.dir.current, path.resolve(context.dir.current, config.output)).replace(/\\/g, '/');
			webpackConfig.entry[relativeOut] =
				'./' + path.relative(context.dir.current, path.resolve(context.dir.current, config.entry)).replace(/\\/g, '/');
		}
	});

	// Register extractor plugin
	webpackConfig.plugins.push(new MiniCssExtractPlugin({'filename': '[name].pseudo.css'}));

	// Prepare optimizers
	if (webpackConfig.optimization.minimizer === undefined)
		webpackConfig.optimization.minimizer = [];

	// Remove pseudo bundles created by extracted files and inject content into the output asset
	var processor = function (assetName, asset, assets) {
		var realAssetname = './' + assetName.replace(/^\.+\//, '').replace(/\.pseudo\.css/, '');
		assets.setAsset(realAssetname, asset.source());
		assets.setAsset(assetName, null);
		return new Promise(function (resolve) {
			resolve(undefined);
		});
	};
	var plugin = new LastCallWebpackPlugin({
		'assetProcessors': [
			{
				'regExp': /\.pseudo\.css/,
				'phase': LastCallWebpackPlugin.PHASES.OPTIMIZE_CHUNK_ASSETS,
				'processor': processor
			},
			{
				'regExp': /\.pseudo\.css\.map/,
				'phase': LastCallWebpackPlugin.PHASES.EMIT,
				'processor': processor
			}
		]
	});
	webpackConfig.optimization.minimizer.push(plugin);

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
				'loader': 'sass-loader',
				'options': {
					'sourceMap': true
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

	// Register entry points
	jsConfig.forEach((config, k) => {
		// Validate
		if (typeof config !== 'object') kill('Invalid js configuration at key: ' + k);
		if (typeof config.entry !== 'string' || config.entry.trim().length === 0)
			kill('Invalid or missing js "entry" at key: ' + k);
		if (typeof config.output !== 'string' || config.output.trim().length === 0)
			kill('Invalid or missing js "output" at key: ' + k);

		// Handle absolute paths
		if (config['absolutePaths'] === true) {
			webpackConfig.entry[config.output] = config.entry;
		} else {
			// Add entry normally
			var relativeOut = path.relative(context.dir.current, path.resolve(context.dir.current, config.output)).replace(/\\/g, '/');
			webpackConfig.entry[relativeOut] =
				'./' + path.relative(context.dir.current, path.resolve(context.dir.current, config.entry)).replace(/\\/g, '/');

		}

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
			'options': callPluginMethod(context.plugins, 'filterEslintOptions', [eslintOptions, context])
		}
	];

	// Add babel loader if required
	if (useBabel) {

		// Add babel itself
		jsLoaders.push({
			'loader': 'babel-loader',
			'options': callPluginMethod(context.plugins, 'filterBabelOptions', [{
				'compact': false,
				'presets': [require('babel-preset-env'), require('babel-preset-es3')],
				"plugins": [require('babel-plugin-transform-runtime')]
			}, context])
		});
	}

	// Register js modules
	webpackConfig.module.rules.push({
		test: /\.js$/,
		exclude: /(node_modules|bower_components)/,
		use: jsLoaders
	});

	// Check if there are provided elements
	var provided = callPluginMethod(context.plugins, 'getJsProvides', [{}, context]);
	if (provided !== {}) {
		webpackConfig.plugins.push(new webpack.ProvidePlugin(provided))
	}

	// Add uglifier if required
	if (context.isProd) {
		webpackConfig.plugins.push(new UglifyJsPlugin({
			'sourceMap': true,
			'extractComments': true,
			'uglifyOptions': {
				'ecma': 5,
				'toplevel': true
			}
		}));
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
 * @param dir
 * @param laborConfig
 * @param mode
 * @returns {null}
 */
module.exports = function WebpackConfigBuilder(dir, laborConfig, mode) {

	// Gather plugin list
	var pluginDefinitions = [];
	pluginDefinitions.push(path.resolve(dir.controller, './plugins/DefaultPlugin.js'));
	if (typeof laborConfig.plugins !== 'undefined' && Array.isArray(laborConfig.plugins)) {
		laborConfig.plugins.forEach(v => {
			pluginDefinitions.push(v);
		});
	}

	// Instantiate plugins
	var plugins = [];
	pluginDefinitions.forEach(v => {
		let pluginPath = path.resolve(dir.buildingNodeModules, v);
		let plugin = null;
		try {
			// Try with the building node modules
			plugin = require(pluginPath);
		} catch (e) {
			try {
				// Try with the projects node modules
				pluginPath = path.resolve(dir.nodeModules, v);
				plugin = require(pluginPath);
			} catch (e) {
				try {
					// try relative from the current path
					pluginPath = path.resolve(dir.current, v);
					plugin = require(pluginPath);
				} catch (e) {
					kill('Invalid plugin path given! Missing plugin: "'+v+'"');
				}
			}

		}
		if (typeof plugin !== 'function') kill('The defined plugin: "' + v + '" is not a function!');
		plugins.push(new plugin());
	});

	// Validate mode
	var validModes = callPluginMethod(plugins, 'getModes', [[]]);
	if (validModes.indexOf(mode) === -1)
		kill('Invalid mode given: "' + mode + '", valid modes are: "' + validModes.join(', ') + '"!');

	// Determine if this is production or not
	var isProd = callPluginMethod(plugins, 'isProd', [false, mode]);

	// Prepare config
	var webpackConfig = {
		'mode': isProd ? 'production' : 'development',
		'watch': mode === 'watch',
		'entry': {},
		'devtool': 'source-map',
		'optimization': {
			'minimize': true
		},
		'performance': {
			'hints': false
		},
		'output': {
			'path': dir.current,
			'filename': './[name]'
		},
		'plugins': [],
		'module': {
			'rules': []
		},
		'resolve': {
			'modules': ['node_modules', dir.nodeModules, dir.buildingNodeModules]
		},
		'resolveLoader': {
			'modules': ['node_modules', dir.buildingNodeModules, dir.nodeModules]
		}
	};

	// Prepare context
	var context = {
		'isProd': isProd,
		'mode': mode,
		'dir': dir,
		'laborConfig': laborConfig,
		'webpackConfig': webpackConfig,
		'plugins': plugins
	};

	// Filter laborConfig by plugin
	laborConfig = callPluginMethod(plugins, 'filterLaborConfig', [laborConfig, context]);

	// Make sure we have stuff to watch
	let hasCss = typeof laborConfig.css !== 'undefined' && Array.isArray(laborConfig.css) && laborConfig.css.length > 0;
	let hasJs = typeof laborConfig.js !== 'undefined' && Array.isArray(laborConfig.js) && laborConfig.js.length > 0;
	if (mode === 'watch' && !hasCss && !hasJs) {
		console.log('Adding pseudo js file to make sure webpack keeps running...');
		addPseudoJsEntryPoint(laborConfig, context);
		hasJs = true;
	}

	// Apply given configuration
	// CSS
	if (hasCss)
		buildCssConfig(webpackConfig, laborConfig.css, context);
	// COPY
	if (typeof laborConfig.copy !== 'undefined' && Array.isArray(laborConfig.copy) && laborConfig.copy.length > 0)
		buildCopyConfig(webpackConfig, laborConfig.copy, context);
	// JS
	if (hasJs)
		buildJsConfig(webpackConfig, laborConfig.js, context);
	// JS COMPAT (Imports loader)
	if (typeof laborConfig.jsCompat !== 'undefined' && Array.isArray(laborConfig.jsCompat) && laborConfig.jsCompat.length > 0)
		buildJsCompatConfig(webpackConfig, laborConfig.jsCompat, context);

	// Call filters
	webpackConfig = callPluginMethod(plugins, 'filter', [webpackConfig, context]);

	// Done
	return webpackConfig;
};