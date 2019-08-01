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
 * Last modified: 2018.12.20 at 16:17
 */
const path = require("path");
module.exports = class TypescriptLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// Prepare exclude pattern
		const baseExcludePattern = /node_modules(?![\\/\\\\]@labor[\\/\\\\])/;
		const excludePattern = context.callPluginMethod("filterExcludePattern", [
			context.builderVersion === 1 ? baseExcludePattern : undefined,
			"typescript", baseExcludePattern, context
		]);

		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.js$|\.jsx$|\.ts$|\.tsx$/, "typescriptLoader", context]),
					exclude: excludePattern === null ? undefined : excludePattern,
					use: [
						{
							"loader": "ts-loader",
							"options": context.callPluginMethod("filterTypescriptOptions", [
								{
									"context": context.dir.current,
									"configFile": path.resolve(context.dir.controller, "../ts/tsconfig.json"),
									"transpileOnly": !(context.currentAppConfig.useTypeChecker === true),
									"experimentalWatchApi": true,
									"onlyCompileBundledFiles": true,
									"compilerOptions": {
										"allowJs": true,
										"target": "es5",
										"moduleResolution": "node",
										"module": "esnext",
										"jsx": "react"
									}
								},
								context
							])
						}
					]
				},
				"typescriptLoader", context
			]));
	}
};