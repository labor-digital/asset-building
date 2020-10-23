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
 * Last modified: 2019.10.04 at 20:40
 */
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {isNull} from "@labor-digital/helferlein/lib/Types/isNull";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import Chalk from "chalk";
import Module from "module";
import * as path from "path";
import {CoreContext} from "./CoreContext";

export class CoreFixes {
	/**
	 * I apply this fix, because I got errors like the one down below, if required files were deleted in
	 * webpack's "watch" mode. The error can be handled internally without a major problem but the script
	 * got killed because events.js complained about an "unhandled error".
	 *
	 * To prevent that error, we simply ignore that "throw" and go our merry way... \o/
	 *
	 * The error example:
	 * events.js:183
	 * throw er; // Unhandled 'error' event
	 *
	 * Error: EPERM: operation not permitted, stat '$FILENAME'
	 * npm ERR! code ELIFECYCLE
	 * npm ERR! errno 1
	 *
	 */
	static eventsJsUncaughtErrorFix() {
		try {
			// Try to load events to apply fix
			const EventEmitter = require("events");
			const _realEmit = EventEmitter.prototype.emit;
			EventEmitter.prototype.emit = function (type) {
				try {
					return _realEmit.apply(this, arguments);
				} catch (e) {
					console.error(Chalk.redBright("An internal error occurred, we should be able to recover, tho!"));
					console.error(Chalk.redBright(e));
				}
				return this;
			};
		} catch (e) {
			// Ignore silently
		}
	};

	/**
	 * We need this fix, because we are a special kind of noodle...
	 * My plan was to encapsulate as much node dependencies into the asset-building package as possible,
	 * so we can stay up to date easily... The problem is, that all dependencies will be installed
	 * inside node_modules directory of @labor-digital/asset-building instead of the project's node_module directory.
	 *
	 * With that in mind, the REAL problem is, that stuff like eslint will ONLY look into the project's
	 * node_module directory and not into our internal directory when it looks up plugins / parsers.
	 *
	 * To fix the resulting problems we supply this fix which helps Module._resolveFilename to look in other
	 * directories when it resolves files.
	 *
	 * @param coreContext
	 */
	static resolveFilenameFix(coreContext: CoreContext) {
		// Make sure we can supply modules from our build context
		const resolveFilenameOrig = (Module as any)._resolveFilename;
		const resolverCache = {};
		(Module as any)._resolveFilename = function resolveFilenameOverride(request, parent, isMain, options) {
			// Prepare cache key to make sure to prevent caching overlay's
			const cacheKey = request + parent.id + isMain;
			const isCacheable = typeof options === "undefined" || options === null;

			// Make sure to only serve from cache if we don't get options
			if (isCacheable && typeof resolverCache[cacheKey] !== "undefined") return resolverCache[cacheKey];

			// Prepare local storage to check if we succeeded
			let result = null;

			try {
				// Try default approach
				result = resolveFilenameOrig(request, parent, isMain, options);
			} catch (e) {
				// Ignore errors 
			}

			// Try harder
			if (isNull(result)) {
				// Create local paths
				let additionalResolverPaths = Array.from(coreContext.additionalResolverPaths).map(
					(s: string) => s.replace(/[\\\/]*$/, ""));

				// Try additional path's to resolve the request filename
				if (!isPlainObject(options)) options = {};
				(options as PlainObject).paths = [path.dirname(parent.filename)].concat(additionalResolverPaths);

				try {
					// Try again
					result = resolveFilenameOrig(request, parent, isMain, options);
				} catch (e) {
					throw new Error("Could not resolve module request: \"" + request +
						"\", tried: \"" + [path.dirname(request), path.dirname(parent.filename)]
							.concat((options as PlainObject).paths).join("\", \"") + "\"" + " | Original error: " + e.message);
				}
			}


			// Store output or skip if the value is not cacheable
			if (!isCacheable) return result;
			return resolverCache[cacheKey] = result;
		};
	}
}