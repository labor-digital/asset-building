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

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isFunction} from "@labor-digital/helferlein/lib/Types/isFunction";
import {isNull} from "@labor-digital/helferlein/lib/Types/isNull";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import fs from "fs";
import path from "path";
import {AssetBuilderEventList} from "../AssetBuilderEventList";
import {CoreContext} from "../Core/CoreContext";
import {WorkerContext} from "../Core/WorkerContext";

export class ExtensionLoader {

	/**
	 * The list of loaded extensions to avoid overrides
	 */
	protected extensions: Array<any>;

	/**
	 * Extension loader constructor
	 */
	public constructor() {
		this.extensions = [];
	}

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
	 * Note that this only LOADS the extension functions into the memory, you will
	 * have to call initExtension() when you are ready to initialize the extension objects
	 * @param scope
	 * @param context
	 * @param extensionPaths
	 */
	public loadExtensions(scope: "global" | "app", context: CoreContext | WorkerContext, extensionPaths: Array<string>): Promise<any> {
		context.eventEmitter.unbindAll(AssetBuilderEventList.EXTENSION_LOADING);
		const extensions = [];
		forEach(extensionPaths, (extensionPath: string) => {
			const extension = this.resolveExtensionPath(context, extensionPath);
			// Ignore if this extension is already known
			if (this.extensions.indexOf(extension) !== -1) {
				console.log("Skipped to load already known extension: " + extension);
				return;
			}
			extensions.push(extension);
			context.eventEmitter.bind(AssetBuilderEventList.EXTENSION_LOADING, () => {
				return extension(context, scope);
			});
		});
		this.extensions = extensions;
		return context.eventEmitter.emitHook(AssetBuilderEventList.EXTENSION_LOADING, {});
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
		forEach([coreContext.buildingNodeModulesPath, coreContext.nodeModulesPath, coreContext.sourcePath], (basePath: string) => {
			try {
				extension = require(path.resolve(basePath, extensionPath));

				// Add additional lookup path for all plugin sources
				let parts = path.dirname(path.resolve(basePath, extensionPath)).split(path.sep);
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
			if (isPlainObject(extension) && isFunction(extension.default)) extension = extension.default;
			else throw new Error("The defined extension: \"" + extensionPath + "\" isn't a function!");
		}

		// Done
		return extension;
	}
}