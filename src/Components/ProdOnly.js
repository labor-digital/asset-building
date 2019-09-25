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
 * Last modified: 2018.12.20 at 18:49
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const merge = require("webpack-merge");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = class ProdOnly {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (!context.isProd) return;

		context.webpackConfig = merge(context.webpackConfig, {
			optimization: {
				minimize: true,
				minimizer: [
					// JS Uglyfier
					new TerserPlugin({
						cache: true,
						parallel: true,
						sourceMap: true,
						extractComments: true,
						terserOptions: {
							// ecma: 5,
							mangle: true,
							toplevel: true,
							compress: {
								typeofs: false
							}
						}
					}),
					// CSS Uglyfier
					new OptimizeCssAssetsPlugin({
						cssProcessorOptions: {
							map: {
								inline: false,
								annotation: true
							}
						}
					})
				]
			}
		});
	}
};