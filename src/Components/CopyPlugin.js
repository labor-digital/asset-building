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
 * Last modified: 2019.01.11 at 17:25
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = class CopyPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (!Array.isArray(context.laborConfig.copy) || context.laborConfig.copy.length === 0) return;

		// Add the context to all configurations
		context.laborConfig.copy.forEach(config => {

			// Validate input
			if (typeof config.from === "undefined")
				throw new Error("Your copy configuration does not define a \"from\" key!");

			// Add context if required
			if (typeof config.context === "undefined") config.context = context.dir.current;

			// Check if we have to rewrite the "from" -> Array to string
			if (Array.isArray(config.from)) {
				var thisValue = config.from.shift();
				var jsonConfig = JSON.stringify(config);
				config.from.forEach(v => {
					var newConfig = JSON.parse(jsonConfig);
					newConfig.from = v;
					context.laborConfig.copy.push(newConfig);
				});
				config.from = thisValue;
			}
		});

		// Make sure we can resolve node modules
		context.laborConfig.copy.forEach(config => {
			// Remove all glob related stuff from the path
			let fromDirectory = path.dirname(config.from.replace(/\*.*?$/, ""));
			let fromPrefix = "";
			if (fromDirectory.length > 0 && !fs.existsSync(fromDirectory)) {
				for (let directory of [context.dir.nodeModules, context.dir.buildingNodeModules, context.dir.current]) {
					fromPrefix = directory;
					if (fs.existsSync(fromPrefix + fromDirectory)) break;
					fromPrefix = "";
				}
				config.from = fromPrefix + config.from;
			}
		});

		// Add copy plugin
		context.webpackConfig.plugins.push(new CopyWebpackPlugin(
			context.callPluginMethod("filterPluginConfig", [
				context.laborConfig.copy,
				"copyPlugin", context
			])
		));
	}
};