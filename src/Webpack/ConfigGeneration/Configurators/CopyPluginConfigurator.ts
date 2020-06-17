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
 * Last modified: 2019.10.06 at 15:35
 */

import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import CopyWebpackPlugin from "copy-webpack-plugin";
import fs from "fs";
import path from "path";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {WorkerContext} from "../../../Core/WorkerContext";
import {AppCopyDefinition} from "../../../Interfaces/AppDefinitionInterface";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class CopyPluginConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		if (!isArray(context.app.copy)) return Promise.resolve(context);

		// Build the list of configurations we should copy for this app
		const isWatch = context.webpackConfig.watch;
		const copyToAdd: Array<AppCopyDefinition> = [];
		context.app.copy.forEach((config: AppCopyDefinition) => {
			if (config.inBuildOnly === true && isWatch) return;
			copyToAdd.push(config);
		});

		// Ignore if there are no copy configurations for this app
		if (copyToAdd.length === 0) return Promise.resolve(context);

		// Add the context to all configurations
		copyToAdd.forEach(config => {

			// Validate input
			if (typeof config.from === "undefined")
				throw new Error("Your copy configuration does not define a \"from\" key!");

			// Add context if required
			if (typeof config.context === "undefined") config.context = context.parentContext.sourcePath;

			// Check if we have to rewrite the "from" -> Array to string
			if (Array.isArray(config.from)) {
				var thisValue = config.from.shift();
				var jsonConfig = JSON.stringify(config);
				config.from.forEach(v => {
					var newConfig = JSON.parse(jsonConfig);
					newConfig.from = v;
					copyToAdd.push(newConfig);
				});
				config.from = thisValue;
			}
		});

		// Make sure we can resolve node modules
		copyToAdd.forEach(config => {
			// Remove all glob related stuff from the path
			let fromDirectory = path.dirname(config.from.replace(/\*.*?$/, ""));
			let fromPrefix = "";
			if (fromDirectory.length > 0 && !fs.existsSync(fromDirectory)) {
				forEach([context.parentContext.nodeModulesPath, context.parentContext.buildingNodeModulesPath, context.parentContext.sourcePath], path => {
					fromPrefix = path;
					if (fs.existsSync(fromPrefix + fromDirectory)) return false;
					fromPrefix = "";
				});
				config.from = fromPrefix + config.from;
			}
		});

		// Allow filtering
		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
			config: copyToAdd,
			options: {copyUnmodified: true},
			identifier,
			context
		}).then(args => {
			context.webpackConfig.plugins.push(new CopyWebpackPlugin({
				patterns: args.config,
				options: args.options
			}));
			return context;
		});
	}
}