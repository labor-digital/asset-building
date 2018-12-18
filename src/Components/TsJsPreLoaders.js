/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
const WebpackPromiseShimPlugin = require("../Bugfixes/WebpackPromiseShimPlugin");
module.exports = class TsJsPreLoaders {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		let loaders = [];

		// Add a polyfill for promises which are required for webpack
		context.webpackConfig.plugins.push(new WebpackPromiseShimPlugin());

		// Polyfills
		if (context.currentAppConfig.polyfills !== false) {
			const additionalPolyfills = Array.isArray(context.currentAppConfig.polyfills) ? context.currentAppConfig.polyfills : [];
			loaders.push({
				"loader": path.resolve(context.dir.controller, "./WebpackLoaders/EntryPointPolyfillPrependLoader.js"),
				"options": {
					"entry": path.resolve(context.dir.current, context.currentAppConfig.entry),
					"polyfills": context.callPluginMethod("filterJsPolyfills", [
						[
							"core-js/fn/promise",
							"core-js/fn/set",
							"core-js/fn/map",
							"core-js/fn/object/assign",
							"core-js/fn/object/entries",
							"core-js/fn/object/keys",
							"core-js/fn/array/from"
						].concat(additionalPolyfills), context])
				}
			});
		}

		// Component loader
		if (context.builderVersion !== 1 && context.currentAppConfig.componentLoader !== false) {
			loaders.push({
				"loader": path.resolve(context.dir.controller, "./WebpackLoaders/ComponentLoader/ComponentLoader.js")
			});
		}

		// Plugin loaders
		loaders = context.callPluginMethod("filterJsPreLoaders", [loaders, context]);

		// Prepare exclude pattern
		const baseExcludePattern = /node_modules(?![\\/\\\\]@labor[\\/\\\\])/;
		const excludePattern = context.callPluginMethod("filterExcludePattern", [
			context.builderVersion === 1 ? baseExcludePattern : undefined,
			"tsJsPreLoaders", baseExcludePattern, context
		]);

		// Inject if not empty
		if(!Array.isArray(loaders) || loaders.length === 0) return;
		context.webpackConfig.module.rules.push({
			test: /\.js$|\.ts$|\.tsx$/,
			exclude: excludePattern === null ? undefined : excludePattern,
			enforce: "pre",
			use: loaders
		});
	}
};