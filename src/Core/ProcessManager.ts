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
 * Last modified: 2019.10.05 at 17:25
 */

import {EventEmitter} from "@labor/helferlein/lib/Events/EventEmitter";
import {asArray} from "@labor/helferlein/lib/FormatAndConvert/asArray";
import {filter} from "@labor/helferlein/lib/Lists/filter";
import {forEach} from "@labor/helferlein/lib/Lists/forEach";
import {isPlainObject} from "@labor/helferlein/lib/Types/isPlainObject";
import {isUndefined} from "@labor/helferlein/lib/Types/isUndefined";
import Chalk from "chalk";
import childProcess from "child_process";
import {AssetBuilderEventList} from "../AssetBuilderEventList";
import {AppDefinitionInterface} from "../Interfaces/AppDefinitionInterface";
import {CoreContext} from "./CoreContext";

export class ProcessManager {

	/**
	 * The list of all processes we have to shutdown
	 */
	protected shutdownList: Array<Function>;

	public constructor(eventEmitter: EventEmitter) {
		this.shutdownList = [];

		// Allow synchronous shutdown of all worker processes
		eventEmitter.bind(AssetBuilderEventList.SHUTDOWN, () => {
			return Promise.all(filter(this.shutdownList, (v) => v()));
		});
	}

	/**
	 * Forks a new worker process for each app that is defined in the core context
	 *
	 * @param coreContext
	 */
	public startWorkerProcessesForCoreContext(coreContext: CoreContext): Promise<any> {
		console.log("Beginning to spawn worker processes...");
		const processes = [];
		let counter = 0;

		// Check if we are running in sequential mode
		if (coreContext.runWorkersSequential) {
			console.log(Chalk.yellowBright("\r\n================================================"));
			console.log(Chalk.yellowBright("\r\nRUNNING WORKERS SEQUENTIAL!"));
			console.log(Chalk.yellowBright("\r\n================================================\r\n"));

			// Wait for one process before calling the next...
			const sequencePromise = new Promise<any>(resolve => {
				const apps = asArray(coreContext.laborConfig.apps);
				let i = 0;

				/**
				 * Helper to iterate over the app list
				 * @param next
				 */
				const next = (next: Function): void => {

					// Check if we have a next app
					const app = apps[i++];
					if (isUndefined(app)) {
						resolve();
						return;
					}
					app.id = counter++;
					let isResolved = false;

					// Start the worker
					const workerPromise = this.startSingleWorkerProcess(coreContext, app);
					processes.push(workerPromise);

					// Go to next app if the worker finished
					workerPromise.then(() => {
						if (isResolved) return;
						isResolved = true;
						next(next);
					});

					// Go to next app if the worker is still running but webpack did it's initial build
					coreContext.eventEmitter.bind(AssetBuilderEventList.SEQUENTIAL_WORKER_QUEUE, () => {
						if (isResolved) return;
						isResolved = true;
						next(next);
					});
				};

				// Start the listener loop
				next(next);
			});
			processes.push(sequencePromise);
		} else {
			// Starting the workers in async mode
			forEach(coreContext.laborConfig.apps, (app: AppDefinitionInterface) => {
				app.id = counter++;
				processes.push(this.startSingleWorkerProcess(coreContext, app));
			});
		}

		// Return the combined promise
		return Promise.all(processes);
	}

	/**
	 * Creates a new worker process for a given app definition
	 * @param coreContext
	 * @param app
	 */
	public startSingleWorkerProcess(coreContext: CoreContext, app: AppDefinitionInterface): Promise<any> {

		// Start the process
		return new Promise<any>((resolve, reject) => {

			// Check if the app is disabled
			if (app.disabled) {
				console.log(Chalk.yellowBright("Ignoring app: " + app.appName + " because it was disabled!"));
				return resolve();
			}

			// Create a new fork
			const worker = childProcess.fork(coreContext.assetBuilderPath + "Worker.js");
			console.log("Spawned worker process: " + app.id + " (" + worker.pid + ")");
			let stopped = false;

			// Allow custom actions on the worker
			coreContext.eventEmitter.emit(AssetBuilderEventList.PROCESS_CREATED, {
				process: worker,
				app: app,
				context: coreContext
			});

			// Register shutdown handler for this worker
			this.shutdownList.push(() => {
				return new Promise(resolve1 => {
					if (stopped) return resolve1();
					console.log("Shutting down worker process: " + app.id + " (" + worker.pid + ")");
					// Stop the work process
					worker.send({SHUTDOWN: true});
					const forceTimeout = setTimeout(() => {
						if (!stopped) {
							console.log("Forcefully killing worker process: " + app.id + " (" + worker.pid + ")");
							worker.kill("SIGTERM");
						}
					}, 5000);
					worker.on("close", () => {
						clearTimeout(forceTimeout);
						stopped = true;
						resolve1();
					});
				});
			});

			// Start the work process
			worker.send({
				context: coreContext.toJson(),
				app: JSON.stringify(app)
			});

			// Wait for a response!
			if (coreContext.runWorkersSequential) {
				worker.on("message", message => {
					if (isPlainObject(message) && message.WEBPACK_DONE === true)
						coreContext.eventEmitter.emit(AssetBuilderEventList.SEQUENTIAL_WORKER_QUEUE);
					else
						console.log("worker responded with message", message);
				});
			}

			// Resolve the promise if the child was closed
			worker.on("exit", (code, signal) => {
				if (stopped) return;
				stopped = true;

				// Check if we got an error
				if (code !== 0 && code !== null) {
					coreContext.eventEmitter.emitHook(AssetBuilderEventList.SHUTDOWN, {})
						.then(() => {
							reject(new Error("The worker process no. " + app.id + " was closed with a non-zero exit code!"));
						});
					return;
				}

				console.log("Worker process no. " + app.id + " finished");
				resolve();
			});
		});
	}
}