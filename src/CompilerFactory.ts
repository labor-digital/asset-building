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
 * Last modified: 2019.10.14 at 19:40
 */

import {isNull} from "@labor/helferlein/lib/Types/isNull";
import {isNumber} from "@labor/helferlein/lib/Types/isNumber";
import {isUndefined} from "@labor/helferlein/lib/Types/isUndefined";
import webpack, {Compiler} from "webpack";
import {AssetBuilderEventList} from "./AssetBuilderEventList";
import {Bootstrap} from "./Core/Bootstrap";
import {CoreContext} from "./Core/CoreContext";
import {WorkerContext} from "./Core/WorkerContext";
import {WebpackConfigGenerator} from "./Webpack/ConfigGeneration/WebpackConfigGenerator";

export class CompilerFactory {

	/**
	 * Can be used to programmatically create a new instance of the webpack compiler
	 * @param cwd The current working directory where we should resolve the package.json in
	 * @param appId Optional numeric index of the app to compile if multiple apps are present.
	 */
	public static getWebpackCompiler(cwd: string, appId?: number): Promise<Compiler> {
		const bootstrap = new Bootstrap(true);
		return bootstrap.initMainProcess(require("../package.json"), cwd, __dirname)
			.then((context: CoreContext) => {
				// Prepare the app id
				if (!isNumber(appId)) appId = 0;

				// Select the app
				const app = context.laborConfig.apps[appId];
				if (isUndefined(app)) return Promise.reject(new Error("Could not find an app with id/index: " + appId));
				app.id = appId;

				// Create the worker
				return bootstrap.initWorkerProcess({
						app: JSON.stringify(app),
						context: context.toJson()
					})
					// Create the webpack config
					.then((context: WorkerContext) => (new WebpackConfigGenerator()).generateConfiguration(context))
					.then((context: WorkerContext) => {
						// Wait until we can filter the webpack callback
						return new Promise((resolve, reject) => {
							context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_WEBPACK_COMPILER, {
								compiler: webpack,
								callback: (err, stats) => {
									// Check if we got obvious errors
									if (!isNull(err)) return reject(err);
									context.webpackCallback(context, stats)
										.then((exitCode) => {
											if (context.webpackConfig.watch !== true) return exitCode;
										}).catch(reject);
								},
								resolve,
								reject,
								context
							}).then(args => {
								const compiler: Function = args.compiler;
								const context: WorkerContext = args.context;
								const c = compiler(context.webpackConfig, args.callback);
								resolve(c);
							});
						});
					});
			});
	}

}