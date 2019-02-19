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
 * Last modified: 2019.02.05 at 17:39
 */

/**
 * Created by Martin Neundorfer on 05.02.2019.
 * For LABOR.digital
 */
const chokidar = require("chokidar");
const SassFile = require("./Entities/SassFile");
const FileHelpers = require("../../Helpers/FileHelpers");
const SassFilePreCompiler = require("./SassFilePreCompiler");
const fs = require("fs");
const MiscHelpers = require("../../Helpers/MiscHelpers");

const cache = new Map();
const watchers = new Set();

module.exports = class SassFileResolver {
	/**
	 * Returns the prepared contents of a given filename
	 * @param {string} filename
	 * @param {string|null} content
	 * @param {module.SassFileResolverContext} context
	 * @return {module.SassFile}
	 */
	static getFile(filename, content, context){

		// Serve the cached file
		const contentHash = typeof content !== "string" ? "-1" : MiscHelpers.md5(content);
		filename = FileHelpers.unifyFilename(filename);
		const filenamePosix = FileHelpers.filenameToPosix(filename);
		if(cache.has(filenamePosix) && cache.get(filenamePosix).hash === contentHash)
			return cache.get(filenamePosix);

		// Create a new sass file instance
		const file = new SassFile();
		file.hash = contentHash;
		file.content = content;
		file.filename = filename;
		file.extension = FileHelpers.getFileExtension(filename);

		// Resolve content if required
		if(file.content === null){
			file.filename = SassFilePreCompiler.resolveImportFilename(
				file.filename, context.baseContext.dir.nodeModules, context.baseFile);
			file.content = fs.readFileSync(file.filename).toString("utf-8");
		}

		// Execute the pre compiler
		SassFilePreCompiler.apply(file, context);

		// Register a watcher for this file
		if(!watchers.has(filenamePosix)){
			watchers.add(filenamePosix);
			try {
				chokidar.watch(filename, {
					"atomic": true,
					"ignoreInitial": true
				}).on("all", (e) => {
					if (cache.has(filenamePosix))
						cache.delete(filenamePosix);
				});
			} catch (e) {
				console.error("Error in sass file watcher", e);
			}
		}

		// Done
		cache.set(filenamePosix, file);
		return file;
	}
};