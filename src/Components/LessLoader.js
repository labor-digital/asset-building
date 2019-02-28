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
 * Last modified: 2019.02.05 at 09:32
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Postcss = require("./SubComponents/Postcss");

module.exports = class LessLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (context.builderVersion === 1)
			LessLoader._applyLegacy(context);
		else
			LessLoader._applyDefault(context);
	}

	static _applyDefault(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.less$/, "lessLoader", context]),
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								publicPath: "../"
							}
						},
						{
							loader: "css-loader"
						},
						Postcss.makeConfig(context),
						{
							loader: "less-loader"
						},
						{
							loader: path.resolve(context.dir.controller, "./WebpackLoaders/ResourceLoader/ResourceLoader.js"),
							options: {
								currentDir: context.dir.current,
								entry: context.currentAppConfig.entry,
								ext: ["less", "css"]
							}
						}
					]
				},
				"lessLoader", context
			]));
	}

	static _applyLegacy(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.less$/, "lessLoader", context]),
					use: [
						{
							loader: MiniCssExtractPlugin.loader
						},
						{
							loader: "css-loader",
							options: {
								url: false
							}
						},
						Postcss.makeConfig(context),
						{
							loader: "less-loader",
							options: {
								relativeUrls: false,
								sourceMap: true
							}
						}
					]
				},
				"lessLoader", context
			]));
	}
};