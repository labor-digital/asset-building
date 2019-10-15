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
 * Last modified: 2019.10.15 at 09:40
 */

import {isNull} from "@labor/helferlein/lib/Types/isNull";
import {isNumber} from "@labor/helferlein/lib/Types/isNumber";
import {isUndefined} from "@labor/helferlein/lib/Types/isUndefined";
import webpack, {Compiler, Configuration} from "webpack";
import {AssetBuilderEventList} from "../AssetBuilderEventList";
import {Bootstrap} from "../Core/Bootstrap";
import {CoreContext} from "../Core/CoreContext";
import {WorkerContext} from "../Core/WorkerContext";
import {AppDefinitionInterface} from "../Interfaces/AppDefinitionInterface";
import {WebpackConfigGenerator} from "../Webpack/ConfigGeneration/WebpackConfigGenerator";

export default class ExpressFactory {
	/**
	 * The instance of the asset builder bootstrap class
	 */
	protected _bootstrap?: Bootstrap;

	/**
	 * Holds the core context instance after it was initialized
	 */
	protected _coreContext?: CoreContext;

	/**
	 * The cwd which point's to the package.json directory
	 */
	protected _packageJsonDirectory: string;

	public constructor(packageJsonDirectory: string) {
		this._packageJsonDirectory = packageJsonDirectory;
	}

	/**
	 * Returns the bootstrap instance of the asset builder
	 */
	public getBootstrap(): Bootstrap {
		if (!isUndefined(this._bootstrap)) return this._bootstrap;
		return this._bootstrap = new Bootstrap(true);
	}

	/**
	 * Returns the core context instance.
	 * You should only use this in development mode!
	 */
	public getCoreContext(): Promise<CoreContext> {
		if (!isUndefined(this._coreContext)) return Promise.resolve(this._coreContext);
		return this.getBootstrap()
			.initMainProcess(require("../../package.json"), this._packageJsonDirectory, require("path").basename(__dirname))
			.then(context => {
				this._coreContext = context;
				return context;
			});
	}

	/**
	 * Gets a worker context either for an appId in the package.json or for a custom app definition.
	 * @param app
	 */
	public getWorkerContext(app?: number | AppDefinitionInterface): Promise<WorkerContext> {
		return this.getCoreContext().then((context: CoreContext) => {
			// Select the app
			if (isUndefined(app)) app = 0;
			if (isNumber(app)) {
				const appId = app as number;
				app = context.laborConfig.apps[appId];
				if (isUndefined(app)) return Promise.reject(new Error("Could not find an app with id/index: " + appId));
			} else {
				app = app as AppDefinitionInterface;
				if (isUndefined(app.id)) return Promise.reject(new Error("The given app definition has to have a \"id\" defined!"));
			}

			// Create the worker context
			return this.getCoreContext().then((context: CoreContext) => {
				return this.getBootstrap().initWorkerProcess({
					app: JSON.stringify(app),
					context: context.toJson()
				});
			});
		});
	}

	/**
	 * Returns the prepared webpack config object for an appId in the package.json or for a custom app definition.
	 * @param app
	 */
	public getWebpackConfig(app?: number | AppDefinitionInterface): Promise<Configuration> {
		return this.getWorkerContext(app).then(context => {
			return (new WebpackConfigGenerator()).generateConfiguration(context)
				.then(context => context.webpackConfig);
		});
	}

	/**
	 * Returns the webpack compiler instance for an appId in the package.json or for a custom app definition.
	 * @param app
	 */
	public getWebpackCompiler(app?: number | AppDefinitionInterface): Promise<Compiler> {
		return this.getWorkerContext(app).then(context => {
			return (new WebpackConfigGenerator()).generateConfiguration(context)
				.then(context => {
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
							let c = compiler(context.webpackConfig, args.callback);
							if (!isUndefined(c.compiler)) c = c.compiler;
							c.assetBuilderContext = context;
							resolve(c);
						});
					});
				});
		});
	}
}