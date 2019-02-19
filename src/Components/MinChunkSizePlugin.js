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
 * Last modified: 2018.12.20 at 16:31
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const webpack = require("webpack");
const WebpackFixBrokenChunkPlugin = require("../Bugfixes/WebpackFixBrokenChunkPlugin");
module.exports = class MinChunkSizePlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// This plugin prevents Webpack from creating chunks
		// that would be too small to be worth loading separately
		if (context.currentAppConfig.minChunkSize !== 0) {
			context.webpackConfig.plugins.push(
				new webpack.optimize.MinChunkSizePlugin(
					context.callPluginMethod("filterPluginConfig", [
						{
							minChunkSize: typeof context.currentAppConfig.minChunkSize === "undefined" ?
								10000 : context.currentAppConfig.minChunkSize
						},
						"minChunkSizePlugin", context
					])
				));
		}

		// Load a bugfix for a crash that happens while using promises, if the plugin above is used
		context.webpackConfig.plugins.push(new WebpackFixBrokenChunkPlugin());
	}
};