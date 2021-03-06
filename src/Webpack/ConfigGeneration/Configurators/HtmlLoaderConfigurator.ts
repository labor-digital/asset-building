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
 * Last modified: 2019.10.05 at 20:26
 */

import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {WorkerContext} from "../../../Core/WorkerContext";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class HtmlLoaderConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
			test: /\.html$/,
			identifier,
			context
		}).then(args => {
			return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
				config: {
					test: args.test,
					use: [{
						loader: "html-loader"
					}]
				},
				identifier,
				context
			});
		}).then(args => {
			context.webpackConfig.module.rules.push(args.config);
			return context;
		});
	}
}