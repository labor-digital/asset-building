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
 * Last modified: 2019.10.05 at 20:50
 */

import {isArray} from "@labor/helferlein/lib/Types/isArray";
import {isObject} from "@labor/helferlein/lib/Types/isObject";
import path from "path";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {WorkerContext} from "../../../Core/WorkerContext";
import {WebpackPromiseShimPlugin} from "../../Plugins/WebpackPromiseShimPlugin";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class JsPreloadConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {

		// Add a polyfill for promises which are required for webpack
		context.webpackConfig.plugins.push(new WebpackPromiseShimPlugin());

		// Storage for temporary values
		let excludePattern = undefined;
		let loaders = [];

		// Loop through the preloader configuration
		return Promise.resolve(context)

			// Add additional polyfills
			.then(() => {
				if (context.app.polyfills === false) return Promise.reject("SKIP");

				// Prepare the list of poly fills
				const polyfills = isArray(context.app.polyfills) ? context.app.polyfills : [];
				polyfills.push("core-js/features/promise/index.js");
				polyfills.push("core-js/features/set/index.js");
				polyfills.push("core-js/features/map/index.js");
				polyfills.push("core-js/features/object/assign.js");
				polyfills.push("core-js/features/object/entries.js");
				polyfills.push("core-js/features/object/keys.js");
				polyfills.push("core-js/features/array/from.js");
				polyfills.push("core-js/features/symbol/index.js");
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_POLYFILLS, {
					polyfills: polyfills, context
				});
			})
			.then(args => {
				loaders.push({
					loader: path.resolve(context.parentContext.assetBuilderPath, "./Webpack/Loaders/PolyfillLoader/PolyfillLoader.js"),
					options: {
						entry: path.resolve(context.parentContext.sourcePath, context.app.entry),
						polyfills: args.polyfills
					}
				});
				return context;
			})
			.catch(err => {
				if (err !== "SKIP") {
					if (isObject(err)) throw err;
					throw new Error(err);
				}
				return context;
			})

			// Allow filtering of the loaders
			.then(() => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_JS_PRE_LOADERS, {
					loaders,
					identifier,
					context
				});
			})
			.then(args => {
				loaders = args.loaders;
				return context;
			})

			// Prepare exclude pattern
			.then(() => {
				const baseExcludePattern = /node_modules(?![\\/\\\\]@labor[\\/\\\\])/;
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_JS_EXCLUDE_PATTERN, {
					pattern: context.builderVersion === 1 ? baseExcludePattern : undefined,
					identifier,
					basePattern: baseExcludePattern,
					context
				});
			})
			.then(args => {
				excludePattern = args.pattern;
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
					test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
					identifier,
					context
				});
			})
			.then(args => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
					config: {
						test: args.test,
						exclude: excludePattern === null ? undefined : excludePattern,
						enforce: "pre",
						use: loaders
					},
					identifier,
					context
				});
			})
			.then(args => {
				if (args.config.use.length === 0) return context;
				context.webpackConfig.module.rules.push(args.config);
				return context;
			});

	}
}