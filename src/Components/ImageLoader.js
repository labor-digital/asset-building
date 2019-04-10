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
 * Last modified: 2019.02.06 at 12:28
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const MiscHelpers = require("../Helpers/MiscHelpers");
module.exports = class ImageLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (context.builderVersion === 1) return;

		// Prepare image optimization configuration
		const imageOptimization = {
			loader: "image-webpack-loader",
			options: {
				disable: !context.isProd || context.currentAppConfig.imageCompression === false,
				mozjpeg: {
					progressive: true,
					quality: typeof context.currentAppConfig.imageCompressionQuality === "number" ?
						context.currentAppConfig.imageCompressionQuality : 80,
					dcScanOpt: 2,
					dct: "float"
				},
				optipng: {
					optimizationLevel: 5
				},
				pngquant: {
					quality: typeof context.currentAppConfig.imageCompressionQuality === "number" ?
						context.currentAppConfig.imageCompressionQuality : 80,
					speed: 2,
					strip: true
				}
			}
		};

		// Name generation which uses a weak hash in development
		const generateName = (file) => {
				if (context.isProd) return "[name]-[hash].[ext]";
				// Use a weak hash -> https://www.bountysource.com/issues/30111085-process-out-of-memory-webpack
				return "[name]-" + MiscHelpers.md5(file) + ".[ext]";
			};

		// Generic images
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.(png|gif|jpe?g)$/, "imageLoader", context]),
					use: [
						{
							loader: "url-loader",
							options: {
								name: generateName,
								outputPath: "assets/",
								limit: context.isProd ? 10000 : 1,
								fallback: {
									loader: "file-loader",
									options: {
										name: generateName,
									}
								}
							}
						},
						imageOptimization
					]
				},
				"imageLoader", context
			]));

		// SVG images -> Fallback for IE 11
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.svg$/, "svgImageLoader", context]),
					use: [
						{
							loader: "svg-url-loader",
							options: {
								name: generateName,
								outputPath: "assets/",
								encoding: context.isProd ? "base64" : "none",
								limit: context.isProd ? 10000 : 1,
								iesafe: true,
								stripdeclarations: true
							}
						},
						imageOptimization
					]
				},
				"svgImageLoader", context
			]));
	}
};