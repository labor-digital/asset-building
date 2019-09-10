/*
 * Copyright 2019 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2019.02.18 at 16:35
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const merge = require("webpack-merge");
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
				"JsCompat.js",

				"LessLoader.js",
				"SassLoader.js",
				"CssExtractPlugin",

				"ProvidePlugin.js",
				"CopyPlugin.js",
				"CleanOutputDirPlugin.js",
				"MinChunkSizePlugin.js",

				"FilterWarningsPlugin.js",
				"DevOnly.js",
				"ProdOnly.js",
				"Analyze.js",
				"HtmlPlugin.js"
			], componentPath, context
		]).forEach(file => {
			const key = file.replace(/\.js$/, "").trim();
			components.set(key, require(componentPath + file));
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
				if (environment !== null && typeof environment.isComponentEnabled === "function")
					enabled = environment.isComponentEnabled(enabled, key, context);
				if (!enabled) return;

				// Execute hooks and component
				context.callPluginMethod("beforeComponent", [context, key]);
				component.apply(context);
				context.callPluginMethod("afterComponent", [context, key]);

				// Apply environment
				if (environment !== null && typeof environment.afterComponent === "function")
					environment.afterComponent(context, key);
			});

			// Apply environment
			if (environment !== null && typeof environment.apply === "function")
				environment.apply(context);


			// Merge with potential user defined configuration
			WebpackConfigBuilder._mergeAdditionalConfig(context, context.currentAppConfig.webpackConfig);

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
		WebpackConfigBuilder._mergeAdditionalConfig(context, context.laborConfig.webpackConfig);

	}

	/**
	 * Prepares the basic webpack configuration for each app
	 * @param {module.ConfigBuilderContext} context
	 * @return {{name: string, mode: string, watch: boolean, entry: {}, plugins: Array, module: {rules: Array}, performance: {hints: boolean}, resolve: {modules: string[], extensions: string[]}, resolveLoader: {modules: string[]}}}
	 * @private
	 */
	static _createBaseConfiguration(context) {
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
				modules: Array.from(context.dir.additionalResolverPaths),
				extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
			},
			resolveLoader: {
				modules: Array.from(context.dir.additionalResolverPaths)
			},
			output: {
				jsonpFunction: "labor_webpack_" + MiscHelpers.md5(context.dir.packageJson + (Math.random() + "") + context.currentApp +
					JSON.stringify(context.currentAppConfig)) + "_" + context.currentApp
			}
		};
	}

	/**
	 * Checks if the app has a specified environment we should apply to the webpack config
	 * @param {module.ConfigBuilderContext} context
	 * @private
	 */
	static _getEnvironmentHandler(context) {

		// Load possible environments
		let environmentHandlers = new Map();
		context.callPluginMethod("getEnvironmentHandlers", [environmentHandlers, context]);

		// Detect an environment
		let environment = typeof context.currentAppConfig.environment === "string" ?
			context.currentAppConfig.environment.trim().toLowerCase() : null;
		context.environment = context.callPluginMethod("getEnvironment", [environment, environmentHandlers, context]);

		// Skip if there is no environment
		if (context.environment === null) return null;

		// Check if we can handle this environment
		if (environmentHandlers.size === 0)
			throw new Error("There are no environment handlers registered!");
		if (!environmentHandlers.has(context.environment))
			throw new Error("Can't handle the given environment: \"" + context.environment + "\"!");
		let handlerFile = environmentHandlers.get(context.environment);
		try {
			handlerFile = require.resolve(handlerFile);
		} catch (e) {
		}
		if (typeof handlerFile !== "string" || !fs.existsSync(handlerFile))
			throw new Error("The handler for the given environment: \"" + context.environment + "\" can not be loaded!");
		const handler = require(handlerFile);
		if (typeof handler !== "function")
			throw new Error("The handler for the given environment: \"" + context.environment + "\" does not return a function!");
		const instance = new handler(context);
		if (typeof instance.init === "function") instance.init();

		// Done
		return instance;
	}

	/**
	 * Merge with potential user defined configuration
	 * @param {module.ConfigBuilderContext} context
	 * @param {string|object} customConfig The path to the custom webpack config, relative to the package json or an object with additional settings
	 * @private
	 */
	static _mergeAdditionalConfig(context, customConfig) {
		// If the customConfig is an array we can directly merge it into the existing webpackConfig
		if (typeof customConfig === "object" && !Array.isArray(customConfig)) {
			context.webpackConfig = merge(context.webpackConfig, customConfig);
			return;
		}

		if (typeof customConfig !== "string") return;

		let customWebpackConfig = null;
		try {
			customWebpackConfig = require(path.resolve(context.dir.current, customConfig));
		} catch (e) {
			throw new Error("Could not resolve the custom webpack config at: \"" + path.resolve(context.dir.current, customConfig) + "\"");
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