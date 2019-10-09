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
 * Last modified: 2019.10.05 at 20:06
 */

import {asArray} from "@labor/helferlein/lib/FormatAndConvert/asArray";
import {md5} from "@labor/helferlein/lib/Misc/md5";
import {inflectToUnderscore} from "@labor/helferlein/lib/Strings/Inflector/inflectToUnderscore";
import {WorkerContext} from "../../../Core/WorkerContext";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class BaseConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		// Build the json-p function name
		const jsonPName = "labor_webpack_" + md5(
			context.parentContext.packageJsonPath +
			(context.isProd ? Math.random() : "") +
			context.appId +
			JSON.stringify(context.app)) + "_" + inflectToUnderscore(context.app.appName);

		// Populate the basic webpack configuration
		context.webpackConfig = {
			name: context.app.appName + "",
			mode: context.isProd ? "production" : "development",
			target: "web",
			watch: context.mode === "watch",
			devtool: context.isProd ? "source-map" : "cheap-module-eval-source-map",
			entry: {},
			plugins: [],
			module: {
				rules: []
			},
			performance: {
				hints: false
			},
			resolve: {
				modules: asArray(context.parentContext.additionalResolverPaths),
				extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
			},
			resolveLoader: {
				modules: asArray(context.parentContext.additionalResolverPaths)
			},
			output: {
				jsonpFunction: jsonPName
			}
		};

		// Done
		return Promise.resolve(context);
	}
}