/**
 * Created by Martin Neundorfer on 06.09.2018.
 * For LABOR.digital
 */
const fs = require('fs');
const path = require('path');
const kill = require('../Helpers/kill');
const ConfigBuilderContext = require('../Entities/ConfigBuilderContext');
module.exports = class ConfigBuilderBootstrap {

	/**
	 * Selects the correct config builder and executes it, returning the created config builder context
	 * @param {module.Dir} dir
	 * @return {module.ConfigBuilderContext}
	 */
	static generateConfigFor(dir) {

		// Check if we are in the correct directory
		if (!fs.existsSync(dir.packageJson))
			kill('Could not find package.json at: "' + dir.packageJson + '"');

		// Check if mode was given mode
		if (typeof process.argv[2] === 'undefined')
			kill('You did not transfer a mode parameter (e.g. build, watch) to the call!');
		let mode = process.argv[2];

		// Load package json
		let packageJson = JSON.parse(fs.readFileSync(dir.packageJson).toString('utf-8'));
		if (typeof packageJson.labor === 'undefined')
			kill('You did not transfer a mode parameter (e.g. build, watch) to the call!');
		let laborConfig = packageJson.labor;

		// Create a new context
		let context = new ConfigBuilderContext(laborConfig, dir, mode);

		// Instantiate plugins
		if (typeof laborConfig.plugins !== 'undefined' && Array.isArray(laborConfig.plugins)) {
			laborConfig.plugins.forEach(v => {
				let plugin = null;
				let pluginBaseName = path.basename(v);
				for (let basePath of [dir.buildingNodeModules, dir.nodeModules, dir.current]) {
					try {
						plugin = require(path.resolve(basePath, v));
					} catch (e) {
						if(e.toString().indexOf('find module') === -1 || e.toString().indexOf(pluginBaseName) === -1)
							kill('Error while loading plugin: "'+v+'" | ' + e.toString());
					}
				}
				if (plugin === null) kill('Invalid plugin path given! Missing plugin: "' + v + '"');
				if (typeof plugin !== 'function') kill('The defined plugin: "' + v + '" is not a function!');
				context.plugins.push(new plugin());
			});
		}

		// Check if there is a definition of a builder version given
		let builderVersion = typeof laborConfig.builderVersion === 'undefined' ? 1 : parseInt(laborConfig.builderVersion);

		// Select version dynamically
		let builder = require('./WebpackConfigBuilder_' + builderVersion);
		let callback = require('./WebpackCallback_' + builderVersion);

		// Validate mode
		var validModes = context.callPluginMethod('getModes', [['watch', 'build']]);
		if (validModes.indexOf(mode) === -1)
			kill('Invalid mode given: "' + mode + '", valid modes are: "' + validModes.join(', ') + '"!');

		// Determine environment variables
		context.builderVersion = builderVersion;
		context.callback = callback;
		context.isProd = context.callPluginMethod('isProd', [mode === 'build', mode]);
		context.webpackConfig.mode = context.isProd ? 'production' : 'development';
		context.webpackConfig.watch = mode === 'watch';

		// Filter laborConfig by plugin
		context.callPluginMethod('filterLaborConfig', [context.laborConfig, context]);

		// Execute the builder
		builder(context);

		// Call filters
		context.callPluginMethod('filterContextBeforeCompiler', [context]);

		// Done
		return context;
	}
};