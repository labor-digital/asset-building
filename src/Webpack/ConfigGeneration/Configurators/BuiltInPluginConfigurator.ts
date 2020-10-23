/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.10.22 at 10:33
 */

import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {AssetBuilderPluginIdentifiers as Ids} from "../../../AssetBuilderPluginIdentifiers";
import {WorkerContext} from "../../../Core/WorkerContext";
import {
	AssetBuilderWebpackPluginInterface,
	AssetBuilderWebpackPluginStaticInterface
} from "../../Plugins/AssetBuilderWebpackPluginInterface";
import {CustomSassLoaderPreCompilerCacheInvalidatePlugin} from "../../Plugins/CustomSassLoaderPreCompilerCacheInvalidatePlugin";
import {FancyStatsPlugin} from "../../Plugins/FancyStatsPlugin";
import {GitAddPlugin} from "../../Plugins/GitAddPlugin";
import {WebpackFixBrokenChunkPlugin} from "../../Plugins/WebpackFixBrokenChunkPlugin";
import {WebpackPromiseShimPlugin} from "../../Plugins/WebpackPromiseShimPlugin";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class BuiltInPluginConfigurator implements ConfiguratorInterface {

	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {

		return Promise.resolve(context)
			.then(c => this.registerPluginWrapper(Ids.GIT_ADD, c, GitAddPlugin))
			.then(c => this.registerPluginWrapper(Ids.FANCY_STATS, c, FancyStatsPlugin))
			.then(c => this.registerPluginWrapper(Ids.FIX_BROKEN_CHUNKS, c, WebpackFixBrokenChunkPlugin))
			.then(c => this.registerPluginWrapper(Ids.PROMISE_SHIM, c, WebpackPromiseShimPlugin))
			.then(c => this.registerPluginWrapper(Ids.CUSTOM_SASS_LOADER_CACHE_INVALIDATOR, c, CustomSassLoaderPreCompilerCacheInvalidatePlugin));

	}

	/**
	 * Internal helper to run the internal plugin lifecycle including all filter functions
	 * @param identifier
	 * @param context
	 * @param plugin
	 * @protected
	 */
	protected registerPluginWrapper(
		identifier: string,
		context: WorkerContext,
		plugin: AssetBuilderWebpackPluginStaticInterface
	): Promise<WorkerContext> {
		const config = isFunction(plugin.getDefaultConfig) ? plugin.getDefaultConfig() ?? {} : {};

		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_BUILT_IN_PLUGIN, {
			identifier,
			usePlugin: true,
			config,
			plugin,
			context
		}).then(args => {

			if (args.usePlugin !== true) {
				return Promise.resolve(context);
			}

			return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
				config: args.config,
				identifier: args.identifier,
				context: args.context
			}).then(_args => {
				const i: AssetBuilderWebpackPluginInterface = new args.plugin(_args.config);

				if (isFunction(i.setContext)) {
					i.setContext(_args.context);
				}

				_args.context.webpackConfig.plugins.push(i);

				return _args.context;
			});

		});
	}
}