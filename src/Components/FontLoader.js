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
 * Last modified: 2019.02.06 at 12:47
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const MiscHelpers = require("../Helpers/MiscHelpers");
module.exports = class fontLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (context.builderVersion === 1) return;

		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/, "fontLoader", context]),
					use: [
						{
							loader: "file-loader",
							options: {
								name: (file) => {
									if(context.isProd) return "[name]-[hash].[ext]";
									// Use a weak hash -> https://www.bountysource.com/issues/30111085-process-out-of-memory-webpack
									return "[name]-" + MiscHelpers.md5(file) + ".[ext]";
								},
								outputPath: "assets/"
							}
						}
					]
				},
				"fontLoader", context
			]));
	}
};