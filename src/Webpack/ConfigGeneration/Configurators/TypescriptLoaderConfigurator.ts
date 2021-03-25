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
 * Last modified: 2019.10.05 at 21:15
 */

import type {PlainObject} from "@labor-digital/helferlein";
import path from "path";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import type {WorkerContext} from "../../../Core/WorkerContext";
import type {ConfiguratorInterface} from "./ConfiguratorInterface";

export class TypescriptLoaderConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {

		// Storage for temporary values
		let excludePattern: RegExp | undefined = undefined;
		let typescriptOptions: PlainObject = {};

		return Promise.resolve(context)

			// Prepare typescript options
			.then(() => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_TYPESCRIPT_OPTIONS, {
					options: {
						// @todo these should be moved into the config file so they coan be exchanged more easily
						context: context.parentContext.sourcePath,
						configFile: path.resolve(context.parentContext.assetBuilderPath, "../ts/tsconfig.json"),
						transpileOnly: !(context.app.useTypeChecker === true),
						experimentalWatchApi: true,
						onlyCompileBundledFiles: true,
						appendTsSuffixTo: [/\.vue$/],
						compilerOptions: {
							allowJs: true,
							target: "es5",
							moduleResolution: "node",
							module: "esnext",
							jsx: "react"
						}
					},
					context
				});
			})
			.then(args => {
				typescriptOptions = args.options;
				return context;
			})

			// Prepare exclude pattern
			.then(() => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_JS_EXCLUDE_PATTERN, {
					pattern: /node_modules/,
					identifier,
					context
				});
			})
			.then(args => {
				excludePattern = args.pattern;
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
					test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
					identifier,
					context
				});
			}).then(args => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
					config: {
						test: args.test,
						exclude: excludePattern === null ? undefined : excludePattern,
						use: [
							{
								loader: "ts-loader",
								options: typescriptOptions
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