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
const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
module.exports = class CleanOutputDirPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {ConfigBuilderContext} context
	 */
	static apply(context) {
		if (!context.isProd) return;
		if (context.builderVersion === 1 || context.currentAppConfig.keepOutputDirectory === true) return;

		const inputDirectory = path.dirname(context.currentAppConfig.entry);
		const outputDirectory = context.webpackConfig.output.path;

		// Add plugin to clean the output directory when the app is compiled
		// But make sure to keep all sources which have been defined in there
		const sourceToExclude = path.relative(outputDirectory, inputDirectory).split(/\\\//).shift()
			.replace(/^[.\\\/]+/g, "");
		const cleanOnceBeforeBuildPatterns = ["**/*"];
		if (sourceToExclude.length > 0) {
			cleanOnceBeforeBuildPatterns.push("!" + sourceToExclude);
			cleanOnceBeforeBuildPatterns.push("!" + sourceToExclude + "/**/*");
		}
		const options = {
			verbose: true,
			cleanStaleWebpackAssets: false,
			cleanOnceBeforeBuildPatterns: cleanOnceBeforeBuildPatterns
		};
		context.webpackConfig.plugins.push(new CleanWebpackPlugin(
			...context.callPluginMethod("filterPluginConfig", [
				[options],
				"cleanOutputDirPlugin", context]
			)));
	}

};