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
 * Last modified: 2019.10.06 at 15:29
 */

import webpack from "webpack";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {WorkerContext} from "../../../Core/WorkerContext";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class ProvidePluginConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		return context.eventEmitter.emitHook(AssetBuilderEventList.GET_JS_PROVIDES, {
				provides: {},
				identifier,
				context
			})
			.then(args => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
					config: args.provides,
					identifier,
					context
				});
			})
			.then(args => {
				context.webpackConfig.plugins.push(new webpack.ProvidePlugin(args.config));
				return context;
			});
	}

}