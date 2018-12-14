/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const MiscHelpers = require("./Helpers/MiscHelpers");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");

module.exports = class WebpackConfigBuilder {
	/**
	 * Builds the webpack configuration for the given context
	 * @param {module.ConfigBuilderContext} context
	 */
	static createConfig(context) {
		// Inject the callback handler
		context.callback = require("./WebpackCallbackHandler").handle;

		// Initialize the configuration
		const webpackConfig = [];

		// Create the list of components
		const components = new Map();
		const componentPath = __dirname + path.sep + "Components" + path.sep;
		context.callPluginMethod("filterComponents", [
			[
				"AppPathes.js",

				"HtmlLoader.js",
				"ImageLoader.js",
				"FontLoader.js",

				"TsJsPreLoaders.js",
				"TypescriptLoader.js",
				"EsLint.js",
				"JsCompat.js",

				"LessLoader.js",
				"SassLoader.js",
				"CssExtractPlugin",

				"ProviderPlugin.js",
				"CopyPlugin.js",
				"CleanOutputDirPlugin.js",
				"MinChunkSize.js",

				"DevOnly.js",
				"ProdOnly.js"
			], context
		]).forEach(file => {
			const key = file.replace(/\.js$/, "").trim();
			components.set(key, require(componentPath + file))
		});

		// Create a webpack config for each app
		for (let i = 0; i < context.laborConfig.apps.length; i++) {
			// Set up the current app context
			context.currentApp = i;
			context.currentAppConfig = context.laborConfig.apps[i];
			context.webpackConfig = WebpackConfigBuilder._createBaseConfiguration(context);

			// Load the environment handler
			const environment = WebpackConfigBuilder._getEnvironmentHandler(context);

			// Run trough the config components
			components.forEach((component, key) => {
				// Check if component is enabled
				let enabled = context.callPluginMethod("isComponentEnabled", [true, key, context]);

				// Give the last decition to the environment handler
				if(environment !== null && typeof environment.isComponentEnabled === "function")
					enabled = environment.isComponentEnabled(enabled, key, context);
				if(!enabled) return;

				// Execute hooks and component
				context.callPluginMethod("beforeComponent", [context, key]);
				component.apply(context);
				context.callPluginMethod("afterComponent", [context, key]);

				// Apply environment
				if(environment !== null && typeof environment.afterComponent === "function")
					environment.afterComponent(context, key);
			});

			// Apply environment
			if(environment !== null && typeof environment.apply === "function")
				environment.apply(context);

			// Write the configuration into the master array
			context.callPluginMethod("filter", [context.webpackConfig, context]);
			webpackConfig.push(context.webpackConfig);
		}

		// Inject the master configuration into the context
		context.webpackConfig = webpackConfig;

		// Clear app based context properties
		context.currentApp = -1;
		context.currentAppConfig = {};
		context.environment = null;

		// Merge with potential user defined configuration
		WebpackConfigBuilder._mergeAdditionalConfig(context);

	}

	/**
	 * Prepares the basic webpack configuration for each app
	 * @param {module.ConfigBuilderContext} context
	 * @return {{name: string, mode: string, watch: boolean, entry: {}, plugins: Array, module: {rules: Array}, performance: {hints: boolean}, resolve: {modules: string[], extensions: string[]}, resolveLoader: {modules: string[]}}}
	 * @private
	 */
	static _createBaseConfiguration(context){
		return {
			name: context.currentApp + "",
			mode: context.isProd ? "production" : "development",
			watch: context.mode === "watch",
			devtool: context.isProd ? "source-map" : "cheap-module-eval-source-map",
			entry: {},
			plugins: [new ProgressBarPlugin()],
			module: {
				rules: []
			},
			performance: {
				hints: false
			},
			resolve: {
				modules: [context.dir.nodeModules, context.dir.buildingNodeModules, "node_modules"],
				extensions: [".ts", ".tsx", ".js", ".json"]
			},
			resolveLoader: {
				modules: [context.dir.buildingNodeModules, context.dir.nodeModules, "node_modules", "/"]
			},
			output: {
				jsonpFunction: "labor_webpack_" + MiscHelpers.md5(context.dir.packageJson) + "_" + context.currentApp
			}
		};
	}

	/**
	 * Checks if the app has a specified environment we should apply to the webpack config
	 * @param {module.ConfigBuilderContext} context
	 * @private
	 */
	static _getEnvironmentHandler(context){

		// Load possible environments
		let environmentHandlers = new Map();
		const dir = path.resolve(__dirname + "/Environments/") + path.sep;
		fs.readdirSync(dir).forEach(file => {
			const key = file.toLowerCase().replace(/\.[^.]*?$/g, "");
			environmentHandlers.set(key, dir + file);
		});
		context.callPluginMethod("getEnvironmentHandlers", [environmentHandlers, context]);

		// Detect an environment
		let environment = typeof context.currentAppConfig.environment === "string" ?
			context.currentAppConfig.environment.trim().toLowerCase() : null;
		context.environment = context.callPluginMethod("getEnvironment", [environment, environmentHandlers, context]);

		// Skip if there is no environment
		if (context.environment === null) return null;

		// Check if we can handle this environment
		if (!environmentHandlers.has(context.environment))
			throw new Error("Can't handle the given environment: \"" + context.environment + "\"!");
		const handlerFile = environmentHandlers.get(context.environment);
		if(typeof handlerFile !== "string" || !fs.existsSync(handlerFile))
			throw new Error("The handler for the given environment: \"" + context.environment + "\" can not be loaded!");
		const handler = require(handlerFile);
		if(typeof handler !== "function")
			throw new Error("The handler for the given environment: \"" + context.environment + "\" does not return a function!");
		const instance = new handler(context);
		if(typeof instance.init === "function") instance.init();

		// Done
		return instance;
	}

	/**
	 * Merge with potential user defined configuration
	 * @param {module.ConfigBuilderContext} context
	 * @private
	 */
	static _mergeAdditionalConfig(context){
		if(typeof context.laborConfig.webpackConfig !== "string") return;
		let customWebpackConfig = null;
		try {
			customWebpackConfig = require(path.resolve(context.dir.current, context.laborConfig.webpackConfig));
		} catch (e) {
			throw new Error("Could not resolve the custom webpack config at: \"" + context.laborConfig.webpackConfig + "\"");
		}
		if (typeof customWebpackConfig !== "function")
			throw new Error("The custom webpack config has to be a function!");
		let changedWebpackConfig = customWebpackConfig(context.webpackConfig, context);
		if (typeof changedWebpackConfig === "undefined")
			throw new Error("The custom webpack config did not return anything! Make sure you return your changed webpack config!");
		if (typeof changedWebpackConfig !== "object" && !Array.isArray(changedWebpackConfig))
			throw new Error("The result ov custom webpack config should either be an object or an array!");
		context.webpackConfig = changedWebpackConfig;
	}
};