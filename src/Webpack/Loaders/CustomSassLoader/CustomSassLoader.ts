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
 * Last modified: 2019.04.22 at 17:11
 */

import fs from "fs";
import sass from "node-sass";
import path from "path";
// noinspection ES6UnusedImports
import * as webpack from "webpack";
import {FileHelpers} from "../../../Helpers/FileHelpers";
import {SassFileResolverContext} from "./Entities/SassFileResolverContext";
import {SassFileResolver} from "./SassFileResolver";
import Loader = webpack.loader.Loader;

const customSassLoader: Loader = function (source: string) {
	const callback = this.async();
	const that = this;
	const errorHandler = function (e) {
		e.hideStack = true;
		if (e.file) {
			if (e.file === "stdin") e.file = that.resourcePath;
			else e.file = path.normalize(e.file);
			e.message = e.message.replace(/\s*Current dir:\s*/, "") +
				"      in " + e.file + " (line " + e.line + ", column " + e.column + ")";
		}
		callback(e, "", null);
	};
	try {
		// Prepare the compiler context
		const context = new SassFileResolverContext(this.query.context, this);

		// Ignore if we don't have to do anything
		if (context.baseExt === "css") return callback(null, source);

		context.init().then(() => {
			const file = SassFileResolver.getFile(context.baseFile, source, context);

			// Helper to create relative paths to our resolved assets,
			// If we supply absolute path's the css-loader will ignore them
			// @see https://github.com/webpack-contrib/css-loader/issues/750
			const pathRelativizer = function (absolutePath) {
				return "./" + FileHelpers.filenameToPosix(path.relative(path.dirname(file.filename), absolutePath));
			};

			// Defines the path to use when resolving files
			context.path.push(file.filename);
			let importError = false;
			const result = sass.renderSync({
				"data": file.content,
				"sourceComments": true,
				"outputStyle": "expanded",
				"importer": function customSassLoaderFileImporter(url) {
					if (importError !== false) return {contents: ""};
					try {
						const importFile = SassFileResolver.getFile(url, null, context);
						return {contents: importFile.content};
					} catch (e) {
						importError = e;
						return {contents: ""};
					}
				},
				"functions": {
					"custom-sass-loader-open-file($file)": function customSassLoaderOpenFile(file) {
						context.path.push(file.getValue());
						return sass.types.Null.NULL;
					},
					"custom-sass-loader-close-file()": function customSassLoaderCloseFile() {
						context.path.pop();
						return sass.types.Null.NULL;
					},
					"custom-sass-loader-url-resolver($url: \"\", $filename: \"\")": function customSassLoaderUrlResolver(url, filename, bridge) {

						// Extract values
						url = url.getValue();
						filename = filename.getValue();

						// Check if this is a data url
						if (url.trim().indexOf("data:") === 0)
							return new sass.types.String(url);

						// Check if this is a url
						if (url.trim().match(/^https?:/))
							return new sass.types.String(url);

						// Handle query string
						const queryString = url.indexOf("?") === -1 && url.indexOf("#") === -1 ? "" : url.replace(/[^?#]*/, "");
						if (queryString !== "") url = url.replace(/[?#].*$/, "");

						// Skip if the url is already readable
						if (fs.existsSync(url)) return new sass.types.String(pathRelativizer(url) + queryString);

						// Resolve the url relative to the filename where it was written
						// This will work with urls that are passed to mixins as well.
						let urlResolved = url;
						if (context.path.length > 0) {
							const localPath = context.path[context.path.length - 1];
							urlResolved = FileHelpers.filenameToPosix(path.resolve(path.dirname(localPath), url));
							if (fs.existsSync(urlResolved)) return new sass.types.String(pathRelativizer(urlResolved) + queryString);
						}

						// Resolve the url relative to the filename where url() is defined
						urlResolved = FileHelpers.filenameToPosix(path.resolve(path.dirname(filename), url));
						if (fs.existsSync(urlResolved)) return new sass.types.String(pathRelativizer(urlResolved) + queryString);

						// Failed to resolve the file
						return new sass.types.String(urlResolved);
					}
				}
			});

			// Check for import errors
			if (importError !== false) throw importError;

			// For debug purposes
			// let debug = path.dirname(this.resourcePath) + path.sep + ".debug.css";
			// console.log("Dumping compiled css debug-file to", debug);
			// fs.writeFileSync(debug, result.css);

			// Register dependencies for this sass file
			if (typeof result.stats === "object" && Array.isArray(result.stats.includedFiles))
				result.stats.includedFiles.forEach(file => {
					this.addDependency(file.replace(/\//g, path.sep));
				});

			callback(null, result.css, null);
		}).catch(e => errorHandler(e));

	} catch (e) {
		errorHandler(e);
	}
};
export default customSassLoader;