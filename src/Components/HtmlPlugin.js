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
 * Last modified: 2018.12.20 at 16:09
 */

/**
 * Created by Martin Neundorfer on 18.12.2018.
 * For LABOR.digital
 */
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = class HtmlPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (typeof context.currentAppConfig.htmlTemplate === "undefined") return;

		// Apply a basic configuration
		let template = context.currentAppConfig.htmlTemplate;
		if (template === true) template = {};
		if (typeof template.template === "undefined") {
			template.template = require("html-webpack-template");
			if (typeof template.inject === "undefined") template.inject = false;
			if (!Array.isArray(template.meta)) {
				template.meta = [
					{
						"http-equiv": "X-UA-Compatible",
						content: "IE=edge,chrome=1"
					}, {
						name: "viewport",
						content: "width=device-width, initial-scale=1.0, user-scalable=0"
					}
				]
			}
		}
		if (typeof template.appMountId === "undefined") template.appMountId = "app";
		template = context.callPluginMethod("filterHtmlTemplate", [template, context]);

		// Inject the plugin
		context.webpackConfig.plugins.push(new HtmlWebpackPlugin(
			context.callPluginMethod("filterPluginConfig", [
				template,
				"htmlPlugin", context
			])
		));
	}
};