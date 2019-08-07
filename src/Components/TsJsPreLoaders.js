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
 * Last modified: 2019.02.05 at 12:56
 */

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
							"core-js/features/promise/index.js",
							"core-js/features/set/index.js",
							"core-js/features/map/index.js",
							"core-js/features/object/assign.js",
							"core-js/features/object/entries.js",
							"core-js/features/object/keys.js",
							"core-js/features/array/from.js",
							"core-js/features/array/iterator.js",
							"core-js/features/symbol/index.js"
						].concat(additionalPolyfills), context])
				}
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
		if (!Array.isArray(loaders) || loaders.length === 0) return;
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.js$|\.ts$|\.tsx$/, "jsTsPreLoader", context]),
					exclude: excludePattern === null ? undefined : excludePattern,
					enforce: "pre",
					use: loaders
				},
				"tsJsPreLoader", context
			]));
	}
};