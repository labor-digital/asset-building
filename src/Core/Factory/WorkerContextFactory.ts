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
 * Last modified: 2020.10.21 at 20:19
 */

import type {PlainObject} from "@labor-digital/helferlein";
import {cloneList, forEach, isArray, isNumber, isUndefined, makeOptions} from "@labor-digital/helferlein";
import {AssetBuilderEventList} from "../../AssetBuilderEventList";
import type {AppDefinitionInterface} from "../../Interfaces/AppDefinitionInterface";
import AppDefinitionSchema from "../AppDefinitionSchema";
import {CoreContext} from "../CoreContext";
import type {FactoryWorkerContextOptions} from "../Factory.interfaces";
import {WorkerContext} from "../WorkerContext";

export class WorkerContextFactory {
	/**
	 * The options used to create the context with
	 * @protected
	 */
	protected _options: FactoryWorkerContextOptions = {};

	/**
	 * Creates a new worker context instance based on the core context and given options
	 * @param coreContext
	 * @param options
	 */
	public make(coreContext: CoreContext, options?: FactoryWorkerContextOptions): Promise<WorkerContext> {
		this._options = options ?? {};

		return this.cloneCoreContextIfRequired(coreContext)
			.then(c => this.makeNewContextInstance(c))
			.then(c => this.loadExtensions(c))
			.then(c => this.applyAppSchema(c))
			.then(c => this.applyAppConfig(c))
			.then(context =>
				context.eventEmitter.emitHook(AssetBuilderEventList.AFTER_WORKER_INIT_DONE, {context})
					.then(() => context)
			);
	}

	/**
	 * Creates a deep clone of the core context to avoid pollution while setting up the worker context
	 * @param coreContext
	 * @protected
	 */
	protected cloneCoreContextIfRequired(coreContext: CoreContext): Promise<CoreContext> {
		if (this._options.cloneCoreContext === false) {
			return Promise.resolve(coreContext);
		}

		const clone = CoreContext.fromJson(coreContext.toJson());
		clone.eventEmitter = coreContext.eventEmitter;
		clone.extensionLoader = coreContext.extensionLoader;

		return Promise.resolve(clone);
	}

	/**
	 * Tries to find the correct app configration object either on the supplied options or on the
	 * core context labor config object
	 *
	 * @param coreContext
	 * @protected
	 */
	protected resolveApp(coreContext: CoreContext): AppDefinitionInterface {
		let app = this._options.app;

		if (isUndefined(app)) {
			app = 0;
		}

		if (isNumber(app)) {
			const appId = app as number;
			app = coreContext.laborConfig!.apps![appId];
			app.id = appId;

			if (isUndefined(app)) {
				new Error("Could not find an app with id/index: " + appId);
			}

		} else {
			app = app as AppDefinitionInterface;
			if (isUndefined(app.id)) {
				new Error("The given app definition has to have an \"id\" defined!");
			}
		}

		return app;
	}

	/**
	 * Creates a new, empty context instance with only the most basic settings applied
	 * @protected
	 */
	protected makeNewContextInstance(coreContext: CoreContext): Promise<WorkerContext> {
		return Promise.resolve(
			new WorkerContext(coreContext, this.resolveApp(coreContext))
		);
	}

	/**
	 * Loads the global and app extensions from the given labor configuration.
	 * Note: Global extensions are only loaded if the core context outs itself as running in a "worker" process
	 * @param context
	 * @protected
	 */
	protected loadExtensions(context: WorkerContext): Promise<WorkerContext> {
		const coreContext = context.parentContext;

		// Only load the "global" extensions if we are in a separate worker process
		return (
			() => {
				if (coreContext.process === "worker") {
					return context.extensionLoader
						.loadExtensionsFromDefinition("global", coreContext, coreContext.laborConfig);
				} else {
					return Promise.resolve();
				}
			}
		)().then(() =>
				coreContext.extensionLoader
					.loadExtensionsFromDefinition("app", context, context.app)
			)
			.then(() => context);
	}

	/**
	 * Applies the app definition schema to the apps defined in the labor config
	 * @param context
	 */
	protected applyAppSchema(context: WorkerContext): Promise<WorkerContext> {
		// Allow extensions to add their own properties to the schema
		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_APP_DEFINITION_SCHEMA, {
				schema: AppDefinitionSchema,
				context,
				app: cloneList(context.app)
			})
			.then((args: PlainObject) => {
				// Don't validate the entry and output options
				if (this._options.noEntryOutputValidation) {
					delete args.schema.entry;
					delete args.schema.output;
				}

				context.app = makeOptions(context.app, args.schema, {allowUnknown: true});
			})
			.then(() => context);
	}

	/**
	 * Applys app specific configuration to the new context instance
	 * @param context
	 * @protected
	 */
	protected applyAppConfig(context: WorkerContext): Promise<WorkerContext> {

		if (isArray(context.app.additionalResolverPaths)) {
			forEach(context.app.additionalResolverPaths, path => {
				context.parentContext.additionalResolverPaths.add(path);
			});
		}

		return Promise.resolve(context);
	}
}