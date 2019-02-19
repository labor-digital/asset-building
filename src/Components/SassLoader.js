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
 * Last modified: 2019.02.05 at 17:40
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Postcss = require("./SubComponents/Postcss");

module.exports = class SassLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// Sass and css loader
		// We route the css over the sass parser, because our internal script will take care of
		// any urls which could otherwise not be resolved correctly
		if (context.builderVersion === 1)
			SassLoader._applyLegacy(context);
		else
			SassLoader._applyDefault(context);
	}

	static _applyDefault(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.(sa|sc|c)ss$/, "sassLoader", context]),
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								publicPath: "../"
							}
						},
						{
							loader: "css-loader",
							options: {
								import: true
							}
						},
						Postcss.makeConfig(context),
						{
							loader: path.resolve(context.dir.controller, "./WebpackLoaders/CustomSassLoader/CustomSassLoader.js"),
							options: {
								currentAppConfig: context.currentAppConfig,
								context
							}
						},
						{
							loader: path.resolve(context.dir.controller, "./WebpackLoaders/ResourceLoader/ResourceLoader.js"),
							options: {
								currentDir: context.dir.current,
								entry: context.currentAppConfig.entry,
								ext: ["sass", "scss", "css"]
							}
						}
					]
				},
				"sassLoader", context
			]));
	}

	static _applyLegacy(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.(sa|sc|c)ss$/, "sassLoader", context]),
					use: [
						{
							loader: MiniCssExtractPlugin.loader
						},
						{
							loader: "css-loader?url=false&-url",
							options: {
								import: false,
								url: false
							}
						},
						{
							loader: "sass-loader?sourceMapRoot=foo",
							options: {
								sourceMap: true,
								outputStyle: "expanded",
								sourceMapContents: true
							}
						}
					]
				},
				"sassLoader", context
			]));
	}
};