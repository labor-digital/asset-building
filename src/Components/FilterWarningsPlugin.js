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
 * Last modified: 2019.01.29 at 17:09
 */

/**
 * Created by Martin Neundorfer on 29.01.2019.
 * For LABOR.digital
 */
const WebpackFilterWarningsPlugin = require("webpack-filter-warnings-plugin");

module.exports = class FilterWarningsPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// Build the list of by default ignored warnings
		const warningsToIgnore = context.callPluginMethod("filterWarningsToIgnore", [
			[
				// Caused by some sort of some non matching tree layout architecture doohickey o.O
				// We don't care, tho: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
				/mini-css-extract-plugin[^]*Conflicting order between:/
			],
			context
		]);

		// Inject the plugin
		context.webpackConfig.plugins.push(
			new WebpackFilterWarningsPlugin(
				...context.callPluginMethod("filterPluginConfig", [
					[{
						exclude: warningsToIgnore
					}],
					"filterWarningsPlugin", context]
				)));
	}
};