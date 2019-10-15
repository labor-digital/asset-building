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
 * Last modified: 2019.10.05 at 17:23
 */

import {EventBus} from "@labor/helferlein/lib/Events/EventBus";
import {PlainObject} from "@labor/helferlein/lib/Interfaces/PlainObject";
import makeOptions from "@labor/helferlein/lib/Misc/makeOptions";
import {isArray} from "@labor/helferlein/lib/Types/isArray";
import {isBool} from "@labor/helferlein/lib/Types/isBool";
import {isString} from "@labor/helferlein/lib/Types/isString";
import {isUndefined} from "@labor/helferlein/lib/Types/isUndefined";
import fs from "fs";
import path from "path";
import {AssetBuilderEventList} from "../AssetBuilderEventList";
import {ExtensionLoader} from "../Extension/ExtensionLoader";
import {FileHelpers} from "../Helpers/FileHelpers";
import {AppDefinitionInterface} from "../Interfaces/AppDefinitionInterface";
import AppDefinitionSchema from "./AppDefinitionSchema";
import {CoreContext} from "./CoreContext";
import {CoreFixes} from "./CoreFixes";
import {WorkerContext} from "./WorkerContext";

let fixesApplied = false;

export class Bootstrap {

	/**
	 * This is true if the asset builder is running in express/single process mode
	 */
	protected _isExpress: boolean;

	public constructor(expressMode?: boolean) {
		this._isExpress = expressMode === true;
	}

	/**
	 * Initializes the core context object for the main process,
	 * which in turn will spawn worker processes for each app definition.
	 * @param assetBuilderPackageJson
	 * @param cwd
	 * @param dirName
	 * @param mode
	 */
	public initMainProcess(assetBuilderPackageJson: PlainObject, cwd: string, dirName: string, mode?: string): Promise<CoreContext> {
		// Render our fancy intro
		if (!this._isExpress) this.fancyIntro(assetBuilderPackageJson.version);

		// Create the core context object
		const coreContext = new CoreContext(cwd, dirName);
		coreContext.isExpress = this._isExpress;
		this.applyEnvironmentFixes(coreContext);

		// Check if we are in the correct directory
		if (!fs.existsSync(coreContext.packageJsonPath))
			return Promise.reject(new Error("Could not find package.json at: \"" + coreContext.packageJsonPath + "\""));

		// Load package json
		const packageJson = JSON.parse(fs.readFileSync(coreContext.packageJsonPath).toString("utf-8"));
		if (typeof packageJson.labor === "undefined")
			return Promise.reject(new Error("There is no \"labor\" node inside your current package json!"));
		coreContext.laborConfig = packageJson.labor;

		// Find the builder version
		coreContext.builderVersion = isUndefined(coreContext.laborConfig.builderVersion) ?
			1 : parseInt(coreContext.laborConfig.builderVersion + "");
		if (coreContext.builderVersion !== 1 && coreContext.builderVersion !== 2)
			return Promise.reject(new Error("An invalid builder version was given!"));

		// Check if we are running in sequential mode
		coreContext.runWorkersSequential = isBool(coreContext.laborConfig.runWorkersSequential) ?
			coreContext.laborConfig.runWorkersSequential :
			coreContext.builderVersion === 1;

		// Clean the work directory
		FileHelpers.flushDirectory(coreContext.workDirectoryPath);

		// Create the context service classes
		coreContext.eventEmitter = EventBus.getEmitter();
		coreContext.extensionLoader = new ExtensionLoader();

		// Register shutdown event
		if (!this._isExpress) {
			const shutdownHandler = function () {
				console.log("Starting main process shutdown...");
				coreContext.eventEmitter.emitHook(AssetBuilderEventList.SHUTDOWN, {})
					.then(() => {
						console.log("Good bye!");
						process.exit(0);
					});
			};
			process.on("SIGTERM", shutdownHandler);
			process.on("SIGINT", shutdownHandler);
			// Windows override to detect the kill command
			if (process.platform === "win32") {
				const rl = require("readline").createInterface({
					input: process.stdin,
					output: process.stdout
				});

				rl.on("SIGINT", function () {
					// @ts-ignore
					process.emit("SIGINT");
				});
			}
		}

		// Load the global extensions
		return coreContext.extensionLoader.loadExtensionsFromDefinition("global", coreContext, coreContext.laborConfig)
			// Start the configuration
			.then(() => {
				return coreContext.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LABOR_CONFIG, {
					laborConfig: coreContext.laborConfig,
					context: coreContext
				});
			})
			.then((args) => {
				// Store the filtered config
				coreContext.laborConfig = args.laborConfig;

				// Apply additional configuration steps
				return this
					.findMode(coreContext, mode)
					.then(coreContext => this.applyLegacyAdapterIfRequired(coreContext))
					.then(coreContext => this.applyDummyAppIfRequired(coreContext));
			})
			// Allow filtering
			.then(context => {
				return new Promise((resolve, reject) => {
					context.eventEmitter.emitHook(AssetBuilderEventList.AFTER_MAIN_INIT_DONE, {context})
						.then(() => resolve(context)).catch(reject);
				});
			});
	}

	/**
	 * Initializes the worker context object for a single webpack compiler process
	 * @param message
	 */
	public initWorkerProcess(message: PlainObject): Promise<WorkerContext> {
		// Validate given message
		if (isUndefined(message.context)) return Promise.reject(new Error("The worker process did not receive a context!"));
		if (isUndefined(message.app)) return Promise.reject(new Error("The worker process did not receive a app definition!"));

		// Unpack the app configuration
		const app: AppDefinitionInterface = JSON.parse(message.app);

		// Warm up the core context and create worker context
		const coreContext = CoreContext.fromJson(message.context);
		coreContext.eventEmitter = EventBus.getEmitter();
		const workerContext = new WorkerContext(coreContext, app);
		coreContext.extensionLoader = new ExtensionLoader();

		if (!this._isExpress) {
			this.applyEnvironmentFixes(coreContext);

			// Register shutdown event
			const shutdownHandler = function () {
				console.log("Starting worker process shutdown...");
				coreContext.eventEmitter.emitHook(AssetBuilderEventList.SHUTDOWN, {})
					.then(() => process.exit(0));
			};
			process.on("SIGTERM", shutdownHandler);
			process.on("SIGINT", shutdownHandler);
		}

		// Load the extensions
		return (this._isExpress ?
			Promise.resolve() :
			coreContext.extensionLoader.loadExtensionsFromDefinition("global", coreContext, coreContext.laborConfig))
			.then(() => coreContext.extensionLoader.loadExtensionsFromDefinition("app", workerContext, app))
			// Build the app definition
			.then(() => this.applyAppSchema(app, workerContext))
			// Build the worker context
			.then((app: AppDefinitionInterface) => {
				workerContext.app = app;
				return workerContext;
			})
			// Allow filtering
			.then(context => {
				return new Promise((resolve, reject) => {
					context.eventEmitter.emitHook(AssetBuilderEventList.AFTER_WORKER_INIT_DONE, {context})
						.then(() => resolve(context)).catch(reject);
				});
			});

	}

	/**
	 * Applies some environment fixes that are required to run our package
	 * @param coreContext
	 */
	protected applyEnvironmentFixes(coreContext: CoreContext) {
		if (fixesApplied) return;
		fixesApplied = true;
		CoreFixes.eventsJsUncaughtErrorFix();
		CoreFixes.resolveFilenameFix(coreContext);
	}

	/**
	 * Finds and validates the given mode we should build the config for
	 * @param coreContext
	 * @param givenMode
	 */
	protected findMode(coreContext: CoreContext, givenMode?: string): Promise<CoreContext> {
		return coreContext.eventEmitter.emitHook(AssetBuilderEventList.GET_MODES, {
			modes: ["watch", "build", "analyze"]
		}).then((args) => {
			const modes = args.modes;
			let mode = isString(givenMode) ? givenMode : (typeof process.argv[2] === "undefined" ? "" : process.argv[2]);
			return coreContext.eventEmitter.emitHook(AssetBuilderEventList.GET_MODE, {
					mode: mode,
					context: coreContext,
					modes
				})
				.then(args => {
					const mode = args.mode;

					// Validate mode
					if (mode === "")
						return Promise.reject(new Error("You did not transfer a mode parameter (e.g. build, watch) to the call!"));
					if (modes.indexOf(mode) === -1)
						return Promise.reject("Invalid mode given: \"" + mode + "\", valid modes are: \"" + modes.join(", ") + "\"!");

					// Set mode
					coreContext.mode = mode;

					// Check if this is a production context
					const isProd = mode === "build" || mode === "analyze";
					return coreContext.eventEmitter.emitHook(AssetBuilderEventList.IS_PROD, {
						isProd,
						mode,
						modes,
						coreContext
					});
				}).then((args) => {
					coreContext.isProd = args.isProd;
					return coreContext;
				});
		});
	}

	/**
	 * Registers the legacy adapter if we got a context with builder version 1
	 * @param coreContext
	 */
	protected applyLegacyAdapterIfRequired(coreContext: CoreContext): Promise<CoreContext> {
		if (coreContext.builderVersion !== 1) return Promise.resolve(coreContext);
		return require("../Legacy/LegacyAdapter").LegacyAdapter.rewriteConfig(coreContext);
	};

	/**
	 * There might be cases where there is actually no webpack config involved, but we are
	 * running other tasks, like copying files e.g. in that case we create a dummy application
	 * @param coreContext
	 */
	protected applyDummyAppIfRequired(coreContext: CoreContext): Promise<CoreContext> {
		if (isArray(coreContext.laborConfig.apps) && coreContext.laborConfig.apps.length > 0)
			return Promise.resolve(coreContext);
		FileHelpers.touch(coreContext.workDirectoryPath + "dummy.js");
		coreContext.laborConfig.apps = [
			{
				appName: "Dummy App",
				entry: path.relative(coreContext.sourcePath, coreContext.workDirectoryPath + "dummy.js"),
				output: path.relative(coreContext.sourcePath, coreContext.workDirectoryPath + "dist" + path.sep + "dummy.js")
			}
		];
		return Promise.resolve(coreContext);
	};

	/**
	 * Applies the app definition schema to the apps defined in the labor config
	 * @param app
	 * @param context
	 */
	protected applyAppSchema(app: AppDefinitionInterface, context: WorkerContext): Promise<AppDefinitionInterface> {
		// Allow extensions to add their own properties to the schema
		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_APP_DEFINITION_SCHEMA, {
				schema: AppDefinitionSchema,
				context,
				app: app
			})
			.then((args: PlainObject) => {
				// Apply the app schema to the definition
				return makeOptions(app, args.schema, {allowUnknown: true});
			});
	}

	/**
	 * Silly helper to render a multilingual intro text including our current version
	 * @param version
	 */
	protected fancyIntro(version) {
		const lang = [
			["Guten Morgen", "Guten Tag", "Guten Abend"],
			["Good morning", "Good day", "Good evening"],
			["Buenos días", "Buenos días", "Buenas noches"],
			["Bonjour", "Bonne journée", "Bonsoir"],
			["Godmorgen", "God dag", "God aften"],
			["Dobro jutro", "Dobar dan", "Dobra večer"],
			["Maidin mhaith", "Dea-lá", "Dea-oíche"],
			["Buongiorno", "Buona giornata", "Buona sera"],
			["Günaydın", "Iyi günler", "İyi aksamlar"]
		];
		const h = new Date().getHours();
		const timeKey = h < 12 ? 0 : (h < 18 ? 1 : 2);
		const langKey = (Math.floor(Math.random() * lang.length));
		const prefix = lang[langKey][timeKey];
		console.log(prefix + ", you are using the LABOR Asset-Builder " + version);
	}
}