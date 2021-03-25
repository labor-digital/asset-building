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
 * Last modified: 2019.10.04 at 20:05
 */

import type {PlainObject} from "@labor-digital/helferlein";
import {forEach, isArray, isFunction, isNull, isPlainObject, isUndefined} from "@labor-digital/helferlein";
import fs from "fs";
import path from "path";
import {AssetBuilderEventList} from "../AssetBuilderEventList";
import type {CoreContext} from "../Core/CoreContext";
import type {WorkerContext} from "../Core/WorkerContext";

export class ExtensionLoader {

	/**
	 * Internal helper to load the list of extensions from a definition object
	 * @param scope
	 * @param context
	 * @param definition
	 */
	public loadExtensionsFromDefinition(scope: "global" | "app", context: CoreContext | WorkerContext, definition: PlainObject): Promise<any> {
		if (!isPlainObject(definition)) return Promise.resolve();
		if (!isArray(definition.extensions)) return Promise.resolve();
		return this.loadExtensions(scope, context, definition.extensions);
	}

	/**
	 * Loads the extension list for either the global extensions, or the app based extension.
	 * @param scope
	 * @param context
	 * @param extensionPaths
	 */
	public loadExtensions(scope: "global" | "app", context: CoreContext | WorkerContext, extensionPaths: Array<string>): Promise<any> {
		context.eventEmitter.unbindAll(AssetBuilderEventList.EXTENSION_LOADING);
		const extensions: Array<Function> = [];
		forEach(extensionPaths, (extensionPath: string) => {
			const extension = this.resolveExtensionPath(context, extensionPath);
			// Ignore if this extension is already known
			if (extensions.indexOf(extension) !== -1) {
				console.log("Skipped to load already known extension: " + extension);
				return;
			}
			extensions.push(extension);
			context.eventEmitter.bind(AssetBuilderEventList.EXTENSION_LOADING, () => {
				return extension(context, scope);
			});
		});
		return context.eventEmitter.emitHook(AssetBuilderEventList.EXTENSION_LOADING, {});
	}

	/**
	 * Interates the given definition in order to find all additional resolver paths that must be
	 * registered and adds them to the given core context object
	 *
	 * @param context The context to find the paths for
	 * @param definition Either the laborConfig or a single app definition
	 */
	public resolveAdditionalResolverPaths(context: CoreContext, definition: PlainObject): void {
		if (isPlainObject(definition)) {

			if (isArray(definition.extensions)) {
				forEach(definition.extensions, (extensionPath: string) => {
					this.resolveExtensionPath(context, extensionPath);
				});
			}

			// Add configured resolver paths to the context
			if (isArray(definition.additionalResolverPaths)) {
				forEach(definition.additionalResolverPaths, path => {
					context.additionalResolverPaths.add(path);
				});
			}

			// Add all resolver paths for potential apps
			if (isArray(definition.apps)) {
				forEach(definition.apps, app => {
					if (isPlainObject(app))
						this.resolveAdditionalResolverPaths(context, app);
				});
			}

		}
	}

	/**
	 * Internal helper to resolve an extension path into a function
	 * @param context
	 * @param extensionPath
	 */
	protected resolveExtensionPath(context: CoreContext | WorkerContext, extensionPath: string): Function {
		let extension = null;
		let extensionBaseName = path.basename(extensionPath);
		const coreContext: CoreContext = (!isUndefined((context as WorkerContext).parentContext) ?
			(context as WorkerContext).parentContext : context as WorkerContext) as CoreContext;
		forEach([coreContext.sourcePath, coreContext.buildingNodeModulesPath, coreContext.nodeModulesPath], (basePath: string) => {
			try {
				extension = require(path.resolve(basePath, extensionPath));

				// Add additional lookup path for all plugin sources
				let parts = path.resolve(basePath, extensionPath).split(path.sep);
				while (parts.length > 0) {
					const pl = parts.join(path.sep) + path.sep + "node_modules" + path.sep;
					if (fs.existsSync(pl)) {
						coreContext.additionalResolverPaths.add(pl);
						break;
					}
					parts.pop();
				}
				return false;
			} catch (e) {
				if (e.toString().indexOf("find module") === -1 || e.toString().indexOf(extensionBaseName) === -1)
					throw new Error("Error while loading extension: \"" + extensionPath + "\" | " + e.toString());
			}
		});

		// Validate extension
		if (isNull(extension)) throw new Error("Invalid extension path given! Missing extension: \"" + extensionPath + "\"");
		if (!isFunction(extension)) {
			if (isPlainObject(extension) && isFunction((extension as any).default)) extension = (extension as any).default;
			else throw new Error("The defined extension: \"" + extensionPath + "\" isn't a function!");
		}

		// Done
		return extension;
	}
}