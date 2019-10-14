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
 * Last modified: 2019.10.06 at 15:49
 */

import webpack from "webpack";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {WorkerContext} from "../../../Core/WorkerContext";
import {WebpackFixBrokenChunkPlugin} from "../../Plugins/WebpackFixBrokenChunkPlugin";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class MinChunkSizePluginConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
				config: {
					minChunkSize: context.app.minChunkSize
				},
				identifier,
				context
			})
			.then(args => {
				context.webpackConfig.plugins.push(new webpack.optimize.MinChunkSizePlugin(args.config));
				return context;
			})
			.then(context => {
				// Load a bugfix for a crash that happens while using promises, if the plugin above is used
				context.webpackConfig.plugins.push(new WebpackFixBrokenChunkPlugin());
				return context;
			});
	}
}