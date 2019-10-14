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
 * Last modified: 2019.10.05 at 17:02
 */

import {EventBus} from "@labor/helferlein/lib/Events/EventBus";
import {PlainObject} from "@labor/helferlein/lib/Interfaces/PlainObject";
import {isNull} from "@labor/helferlein/lib/Types/isNull";
import {isObject} from "@labor/helferlein/lib/Types/isObject";
import {isUndefined} from "@labor/helferlein/lib/Types/isUndefined";
import Chalk from "chalk";
import webpack from "webpack";
import {AssetBuilderEventList} from "./AssetBuilderEventList";
import {Bootstrap} from "./Core/Bootstrap";
import {WorkerContext} from "./Core/WorkerContext";
import {WebpackConfigGenerator} from "./Webpack/ConfigGeneration/WebpackConfigGenerator";

let isRunning = false;

function init(message) {
	(new Bootstrap())
		.initWorkerProcess(message)
		.then((context: WorkerContext) => (new WebpackConfigGenerator()).generateConfiguration(context))
		.then(context => {
			return new Promise((resolve, reject) => {
				context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_WEBPACK_COMPILER, {
					compiler: webpack,
					callback: (err, stats) => {
						// Check if we got obvious errors
						if (!isNull(err)) return reject(err);
						context.webpackCallback(context, stats)
							.then((exitCode) => {
								process.send({WEBPACK_DONE: true});
								if (exitCode === -1) {
									console.log("Webpack finished, but I should keep the script running...");
									return;
								}
								if (context.webpackConfig.watch !== true) return resolve(exitCode);
							}).catch(reject);
					},
					resolve,
					reject,
					context
				}).then(args => {
					const compiler: Function = args.compiler;
					const context: WorkerContext = args.context;
					compiler(context.webpackConfig, args.callback);
				}).catch(reject);
			});
		})
		.then((exitCode: number) => process.exit(exitCode))
		.catch(err => {
			if (isObject(err) && !isUndefined(err.stack)) err = err.stack;
			console.error("");
			console.error(Chalk.redBright("ERROR IN WORKER PROCESS:"));
			console.error(Chalk.redBright(err));
			process.exit(1);
		});
}

process.on("message", (message: PlainObject) => {
	if (message.SHUTDOWN === true) {
		console.log("Starting worker process (" + process.pid + ") shutdown...");
		EventBus.emitHook(AssetBuilderEventList.SHUTDOWN, {}).then(() => process.exit(0));
	} else if (!isRunning) init(message);
});

process.on("SIGTERM", function () {
	console.log("Stopping worker process!");
	process.exit(0);
});