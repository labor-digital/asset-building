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
 * Last modified: 2019.10.06 at 11:34
 */

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {WorkerContext} from "../../../Core/WorkerContext";
import {CustomSassLoaderPreCompilerCacheInvalidatePlugin} from "../../Plugins/CustomSassLoaderPreCompilerCacheInvalidatePlugin";
import {AbstractStyleLoaderConfigurator} from "./AbstractStyleLoaderConfigurator";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class SassLoaderConfigurator extends AbstractStyleLoaderConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		let postCssConfig = null;

		// Register cache clear plugin for custom sass compiler
		context.webpackConfig.plugins.push(new CustomSassLoaderPreCompilerCacheInvalidatePlugin());

		// Build config
		return this.makePostcssConfig(identifier, context)
			.then(config => {
				postCssConfig = config;
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
					test: /\.(sa|sc|c)ss$/,
					identifier,
					context
				});
			})
			.then(args => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
					config: {
						test: args.test,
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
							postCssConfig,
							{
								loader: path.resolve(context.parentContext.assetBuilderPath, "./Webpack/Loaders/CustomSassLoader/CustomSassLoader.js"),
								options: {
									app: context.app,
									context
								}
							},
							{
								loader: path.resolve(context.parentContext.assetBuilderPath, "./Webpack/Loaders/ResourceLoader/ResourceLoader.js"),
								options: {
									currentDir: context.parentContext.sourcePath,
									entry: context.app.entry,
									ext: ["sass", "scss", "css"]
								}
							}
						]
					},
					identifier,
					context
				});
			}).then(args => {
				context.webpackConfig.module.rules.push(args.config);
				return context;
			});
	}

	public applyLegacy(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		let postCssConfig = null;
		return this.makePostcssConfig(identifier, context)
			.then(config => {
				postCssConfig = config;
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
					test: /\.(sa|sc|c)ss$/,
					identifier,
					context
				});
			})
			.then(args => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
					config: {
						test: args.test,
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
							postCssConfig,
							{
								loader: "sass-loader?sourceMapRoot=foo",
								options: {
									sourceMap: true,
									sassOptions: {
										outputStyle: "expanded"
									}
								}
							}
						]
					},
					identifier,
					context
				});
			}).then(args => {
				context.webpackConfig.module.rules.push(args.config);
				return context;
			});
	}

}