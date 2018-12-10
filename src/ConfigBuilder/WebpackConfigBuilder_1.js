/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
const crypto = require('crypto');
const webpack = require('webpack');
const addPseudoJsEntryPoint = require('./Parts/addPseudoJsEntryPoint');
const buildCssConfig = require('./Parts/buildCssConfig');
const buildCopyConfig = require('./Parts/buildCopyConfig');
const buildJsConfig = require('./Parts/buildJsConfig');
const buildJsCompatConfig = require('./Parts/buildJsCompatConfig');
const resolveFilenameFix = require('./Parts/resolveFilenameFix');

/**
 * Builds a valid webpack config based of the labor configuration syntax
 * @param {module.ConfigBuilderContext} context
 * @returns {*}
 */
module.exports = function WebpackConfigBuilder_1 (context) {

	// Prepare config
	context.webpackConfig = Object.assign(context.webpackConfig, {
		'entry': {},
		'devtool': '',
		'optimization': {
			'minimize': false
		},
		'output': {
			'path': context.dir.current,
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

	// Generate a name for our jsonp function
	const jsonpFunction = "webpack_" + crypto.createHash('md5').update(context.dir.packageJson).digest("hex");
	context.webpackConfig.output.jsonpFunction = jsonpFunction;

	// Call filters
	context.callPluginMethod('filter', [context.webpackConfig, context]);

	// Apply resolve filename fix
	resolveFilenameFix(context.dir);

	// Done
	return context;
};