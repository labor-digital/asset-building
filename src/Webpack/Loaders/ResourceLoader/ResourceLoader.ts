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

import fs from "fs";
import path from "path";
// noinspection ES6UnusedImports
import * as webpack from "webpack";
import {FileHelpers} from "../../../Helpers/FileHelpers";
import Loader = webpack.loader.Loader;

const resourceLoader: Loader = function (source: string) {
	// Make this loader async
	const callback = this.async();

	// Ignore empty inputs
	if (source.replace(/[\s\n]+/g, "").trim() === "") {
		callback(null, source);
		return;
	}

	// Prepare file locations
	let stylesheetPath = FileHelpers.unifyFilename(FileHelpers.stripOffQuery(this.resourcePath));
	let rootPath = FileHelpers.unifyFilename(this.query.currentDir + path.dirname(this.query.entry)) + path.sep;
	const possibleResourceLocations = [];

	// Register root resources
	this.query.ext.forEach(ext => {
		const possiblePath = path.resolve(rootPath) + path.sep + "Resources." + ext;
		possibleResourceLocations.push(possiblePath);
	});

	// Check if we have to search upwards for resources in our root path
	if (stylesheetPath.indexOf(rootPath) === -1) {
		const rootParts = rootPath.split(path.sep);
		while (rootParts.length > 0) {
			rootParts.pop();
			if (stylesheetPath.indexOf(rootParts.join(path.sep) + path.sep) === 0) {
				rootPath = rootParts.join(path.sep) + path.sep;
				break;
			}
		}
	}

	// Add resources up to the root directory
	if (stylesheetPath.indexOf(rootPath) === 0) {
		// We can traverse the path down...
		const pathParts = stylesheetPath.replace(rootPath, "").split(path.sep);
		pathParts.unshift(".");
		pathParts.pop();
		let localPath = "";
		pathParts.forEach(part => {
			localPath += part + path.sep;
			this.query.ext.forEach(ext => {
				const possiblePath = path.resolve(rootPath + localPath) + path.sep + "Resources." + ext;
				if (possibleResourceLocations.indexOf(possiblePath) !== -1) return;
				possibleResourceLocations.push(possiblePath);
			});
		});
	}

	// Filter out all non-existing resources
	const existingResourceLocations = possibleResourceLocations.filter((v) => fs.existsSync(v));

	// Skip if there are no resources
	if (existingResourceLocations.length === 0) {
		callback(null, source);
		return;
	}

	// Make wrapper to import the required files
	const wrapper = [];
	existingResourceLocations.forEach(file => {
		wrapper.push("@import \"" + FileHelpers.unifyFilename(file) + "\";");
	});

	callback(null, wrapper.join("\r\n") + "\r\n" + source);
};
export default resourceLoader;