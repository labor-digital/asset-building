/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.10.21 at 19:12
 */

import {EventBus} from "@labor-digital/helferlein/lib/Events/EventBus";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isBool} from "@labor-digital/helferlein/lib/Types/isBool";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import fs from "fs";
import path from "path";
import {AssetBuilderEventList} from "../../AssetBuilderEventList";
import {ExtensionLoader} from "../../Extension/ExtensionLoader";
import {FileHelpers} from "../../Helpers/FileHelpers";
import {CoreContext} from "../CoreContext";
import {FactoryCoreContextOptions} from "../Factory.interfaces";

export class CoreContextFactory {

	/**
	 * The options used to create the context with
	 * @protected
	 */
	protected _options: FactoryCoreContextOptions;

	/**
	 * Creates a new instance of the core context object based on the given options
	 * @param options
	 */
	public make(options: FactoryCoreContextOptions): Promise<CoreContext> {
		this._options = options ?? {};

		return this.makeNewContextInstance()
			.then(c => this.loadConfig(c))
			.then(c => this.applyConfig(c))
			.then(c => this.loadExtensions(c))
			.then(c => this.findMode(c))
			.then(c => this.ensureWorkDirectory(c))
			.then(c => this.applyLegacyAdapterIfRequired(c))
			.then(c => this.applyDummyAppIfRequired(c))
			.then(c => this.applyLateHook(c));
	}

	/**
	 * Creates a new, empty context instance with only the most basic settings applied
	 * @protected
	 */
	protected makeNewContextInstance(): Promise<CoreContext> {
		return Promise.resolve(
			new CoreContext(
				this._options.cwd ?? process.cwd(),
				path.dirname(path.dirname(__dirname)),
				this._options.environment ?? "standalone"
			)
		).then(context => {
			// Late dependency injection
			context.eventEmitter = EventBus.getEmitter();
			context.extensionLoader = new ExtensionLoader();
			context.version = require("../../../package.json").version;

			return context;
		});
	}

	/**
	 * Either loads the asset builder configuration from the source package.json or
	 * uses the given configuration from the options
	 * @param context
	 * @protected
	 */
	protected loadConfig(context: CoreContext): Promise<CoreContext> {
		if (isUndefined(this._options.laborConfig)) {
			// Check if we are in the correct directory
			if (!fs.existsSync(context.packageJsonPath)) {
				return Promise.reject(new Error("Could not find package.json at: \"" + context.packageJsonPath + "\""));
			}

			// Load the config using the package json
			const packageJson = JSON.parse(fs.readFileSync(context.packageJsonPath).toString("utf-8"));
			if (typeof packageJson.labor === "undefined") {
				return Promise.reject(new Error("There is no \"labor\" node inside your current package json!"));
			}
			context.laborConfig = packageJson.labor;

		} else {
			context.laborConfig = this._options.laborConfig;
		}

		return Promise.resolve(context);
	}

	/**
	 * Applys the global labor configuration to the new context instance
	 * @param context
	 * @protected
	 */
	protected applyConfig(context: CoreContext): Promise<CoreContext> {

		// Find the builder version
		context.builderVersion = isUndefined(context.laborConfig.builderVersion) ?
			2 : parseInt(context.laborConfig.builderVersion + "");

		if (context.builderVersion !== 1 && context.builderVersion !== 2) {
			return Promise.reject(new Error("An invalid builder version was given!"));
		}

		// Check if we are running in sequential mode
		context.runWorkersSequential = isBool(context.laborConfig.runWorkersSequential) ?
			context.laborConfig.runWorkersSequential :
			context.builderVersion === 1;

		// Add configured resolver paths to the context
		if (isArray(context.laborConfig.additionalResolverPaths)) {
			forEach(context.laborConfig.additionalResolverPaths, path => {
				context.additionalResolverPaths.add(path);
			});
		}

		return Promise.resolve(context);
	}

	/**
	 * Loads the global extensions from the given labor configuration
	 * @param context
	 * @protected
	 */
	protected loadExtensions(context: CoreContext): Promise<CoreContext> {
		return context.extensionLoader
			.loadExtensionsFromDefinition("global", context, context.laborConfig)
			.then(() =>
				context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LABOR_CONFIG, {
					laborConfig: context.laborConfig,
					context: context
				})
			)
			.then((args) => {
				context.laborConfig = args.laborConfig;
				return context;
			});
	}

	/**
	 * Finds and validates the given mode we should build the config for
	 * @param context
	 */
	protected findMode(context: CoreContext): Promise<CoreContext> {
		return context.eventEmitter.emitHook(AssetBuilderEventList.GET_MODES, {
			modes: ["watch", "build", "analyze"]
		}).then((args) => {

			const modes = args.modes;
			let mode = isString(this._options.mode)
				? this._options.mode
				: (typeof process.argv[2] === "undefined" ? "watch" : process.argv[2]);

			return context.eventEmitter.emitHook(AssetBuilderEventList.GET_MODE, {
					mode: mode,
					context: context,
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
					context.mode = mode;

					// Check if this is a production context
					const isProd = mode === "build" || mode === "analyze";
					return context.eventEmitter.emitHook(AssetBuilderEventList.IS_PROD, {
						isProd,
						mode,
						modes,
						coreContext: context
					});
				}).then((args) => {
					context.isProd = args.isProd;
					return context;
				});
		});
	}

	/**
	 * Registers the legacy adapter if we got a context with builder version 1
	 * @param coreContext
	 */
	protected applyLegacyAdapterIfRequired(coreContext: CoreContext): Promise<CoreContext> {
		if (coreContext.builderVersion !== 1) return Promise.resolve(coreContext);
		return require("../../Legacy/LegacyAdapter").LegacyAdapter.rewriteConfig(coreContext);
	};

	/**
	 * There might be cases where there is actually no webpack config involved, but we are
	 * running other tasks, like copying files e.g. in that case we create a dummy application
	 * @param context
	 */
	protected applyDummyAppIfRequired(context: CoreContext): Promise<CoreContext> {
		if (isArray(context.laborConfig.apps) && context.laborConfig.apps.length > 0)
			return Promise.resolve(context);
		FileHelpers.touch(context.workDirectoryPath + "dummy.js");
		context.laborConfig.apps = [
			{
				appName: "Dummy App",
				entry: path.relative(context.sourcePath, context.workDirectoryPath + "dummy.js"),
				output: path.relative(context.sourcePath, context.workDirectoryPath + "dist" + path.sep + "dummy.js")
			}
		];
		return Promise.resolve(context);
	};

	/**
	 * Makes sure the work directory exists and is keept nice and clean
	 * @param context
	 * @protected
	 */
	protected ensureWorkDirectory(context: CoreContext): Promise<CoreContext> {
		FileHelpers.mkdir(context.workDirectoryPath);
		FileHelpers.flushDirectory(context.workDirectoryPath);
		return Promise.resolve(context);
	};

	/**
	 * Emits the late hook to filter the context after it was completely instantiated
	 * @param context
	 * @protected
	 */
	protected applyLateHook(context: CoreContext): Promise<CoreContext> {
		return context.eventEmitter
			.emitHook(AssetBuilderEventList.AFTER_MAIN_INIT_DONE, {context})
			.then(() => context);
	}
}