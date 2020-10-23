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
 * Last modified: 2020.10.21 at 21:29
 */

import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {AssetBuilderConfiguratorIdentifiers as Ids} from "../../AssetBuilderConfiguratorIdentifiers";
import {AssetBuilderEventList} from "../../AssetBuilderEventList";
import {AssetBuilderPluginIdentifiers as PluginIds} from "../../AssetBuilderPluginIdentifiers";
import {WorkerContext} from "../../Core/WorkerContext";
import {WebpackConfigGenerator} from "../ConfigGeneration/WebpackConfigGenerator";
import {WorkerActionInterface} from "./WorkerActionInterface";

export interface MakeConfigurationActionOptions {
	/**
	 * An optional list of configurator ids that should be disabled when the config is generated
	 */
	disableConfigurators?: Array<Ids>

	/**
	 * A list of all asset builder plugin ids that should be disabled when the configuration is being build
	 */
	disablePlugins?: Array<PluginIds>

}

export class MakeConfigurationAction implements WorkerActionInterface {

	/**
	 * @inheritDoc
	 */
	public do(context: WorkerContext, options?: MakeConfigurationActionOptions): any {
		options = options ?? {};

		this.bindDisalbedElementListener(context, options);

		return (new WebpackConfigGenerator())
			.generateConfiguration(context)
			.then(context =>
				context.parentContext.eventEmitter.emitHook(AssetBuilderEventList.INTEROP_WEBPACK_CONFIG, {
					environment: context.parentContext.environment,
					context,
					config: context.webpackConfig
				})
			)
			.then(args => args.config);
	}

	/**
	 * Binds an event listener to disable some configurators if required by the given options
	 * @param context
	 * @param options
	 * @protected
	 */
	protected bindDisalbedElementListener(context: WorkerContext, options?: MakeConfigurationActionOptions): void {
		if (isArray(options.disableConfigurators)) {
			context.eventEmitter.bind(AssetBuilderEventList.FILTER_CONFIGURATOR, (e) => {
				if (options.disableConfigurators.indexOf(e.args.identifier) === -1) {
					return;
				}
				e.args.useConfigurator = false;
			});
		}
		if (isArray(options.disablePlugins)) {
			context.eventEmitter.bind(AssetBuilderEventList.FILTER_BUILT_IN_PLUGIN, (e) => {
				if (options.disablePlugins.indexOf(e.args.identifier) === -1) {
					return;
				}
				e.args.usePlugin = false;
			});
		}
	}

}
