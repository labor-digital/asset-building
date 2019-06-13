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
 * Last modified: 2019.02.18 at 20:34
 */

/**
 * Created by Martin Neundorfer on 08.01.2019.
 * For LABOR.digital
 */
const MiscHelpers = require("../../Helpers/MiscHelpers");

module.exports = class Postcss {
	/**
	 * Defines the post css configuration for sass and less loaders
	 * @param {module.ConfigBuilderContext} context
	 */
	static makeConfig(context) {
		return {
			loader: "postcss-loader",
			options: {
				ident: "postcss-" + MiscHelpers.md5(Math.random() + "" + Math.random()),
				plugins: (loader) => Postcss.getPostCssPluginList(context, loader)
			}
		};
	}

	/**
	 * Returns the list of all required postcss plugins
	 * @param context
	 * @param loader
	 * @return {*}
	 */
	static getPostCssPluginList(context, loader) {
		return context.callPluginMethod("postCssPluginFilter", [
			[
				require("autoprefixer")({
					overrideBrowserslist: context.callPluginMethod("browserListFilter", ["> 1%, last 10 versions", context])
				}),
				require("iconfont-webpack-plugin")({
					resolve: loader.resolve,
					modules:false
				})
			], context
		]);
	}
};