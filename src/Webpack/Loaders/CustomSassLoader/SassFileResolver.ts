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
 * Last modified: 2019.02.18 at 20:58
 */

import {isString, md5} from "@labor-digital/helferlein";
import fs from "fs";
import {FileHelpers} from "../../../Helpers/FileHelpers";
import {SassFile} from "./Entities/SassFile";
import type {SassFileResolverContext} from "./Entities/SassFileResolverContext";
import {SassFilePreCompiler} from "./SassFilePreCompiler";

const cache = new Map();

export class SassFileResolver {
	/**
	 * Returns the prepared contents of a given filename
	 * @param filename
	 * @param content
	 * @param context
	 */
	static getFile(filename: string, content: string | null, context: SassFileResolverContext): SassFile {

		// Serve the cached file
		const contentHash = typeof content !== "string" ? "-1" : md5(content);
		filename = FileHelpers.unifyFilename(filename);
		const filenamePosix = FileHelpers.filenameToPosix(filename);
		if (cache.has(filenamePosix) && cache.get(filenamePosix).hash === contentHash)
			return cache.get(filenamePosix);

		// Create a new sass file instance
		const file = new SassFile();
		file.hash = contentHash;
		file.content = content!;
		file.filename = filename;
		file.extension = FileHelpers.getFileExtension(filename);

		// Resolve content if required
		if (file.content === null) {
			file.filename = SassFilePreCompiler.resolveImportFilename(context, file.filename, context.baseFile);
			file.content = fs.readFileSync(file.filename).toString("utf-8");
		}

		// Execute the pre compiler
		SassFilePreCompiler.apply(file, context);

		// Done
		cache.set(filenamePosix, file);
		return file;
	}

	/**
	 * Used to invalidate the cached information for a specific file
	 * This is mostly an internal hook that is called when webpack invalidates a file
	 * @param filename
	 */
	static invalidate(filename: string) {
		if (!isString(filename)) return;
		const filenamePosix = FileHelpers.filenameToPosix(filename);
		if (!cache.has(filenamePosix)) return;
		cache.delete(filenamePosix);
	}
}