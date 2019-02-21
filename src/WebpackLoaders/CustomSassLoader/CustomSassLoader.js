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
 * Last modified: 2019.02.06 at 11:49
 */

/**
 * Created by Martin Neundorfer on 12.09.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const sass = require("node-sass");
const FileHelpers = require("../../Helpers/FileHelpers");

const SassFileResolverContext = require("./Entities/SassFileResolverContext");
const SassFileResolver = require("./SassFileResolver");

module.exports = function customSassLoader(sassSource) {
	const callback = this.async();

	try {
		// Prepare the compiler context
		const context = new SassFileResolverContext(this.query.context, this);
		const file = SassFileResolver.getFile(context.baseFile, sassSource, context);

		// Defines the path to use when resolving files
		context.path.push(file.filename);

		const result = sass.renderSync({
			"data": file.content,
			"sourceComments": true,
			"outputStyle": "expanded",
			"importer": function customSassLoaderFileImporter(url) {
				const importFile = SassFileResolver.getFile(url, null, context);
				return {contents: importFile.content};
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
					if (fs.existsSync(url)) return new sass.types.String(url + queryString);

					// Resolve the url relative to the filename where it was written
					// This will work with urls that are passed to mixins as well.
					let urlResolved = url;
					if(context.path.length > 0){
						const localPath = context.path[context.path.length -1];
						urlResolved = FileHelpers.filenameToPosix(path.resolve(path.dirname(localPath), url));
						if(fs.existsSync(urlResolved)) return new sass.types.String(urlResolved + queryString);
					}

					// Resolve the url relative to the filename where url() is defined
					urlResolved = FileHelpers.filenameToPosix(path.resolve(path.dirname(filename), url));
					if(fs.existsSync(urlResolved)) return new sass.types.String(urlResolved + queryString);

					// Failed to resolve the file
					return new sass.types.String(urlResolved);
				}
			}
		});

		// For debug purposes
		// let debug = path.dirname(this.resourcePath) + path.sep + ".debug.css";
		// fs.writeFileSync(debug, result.css);

		// Register dependencies for this sass file
		if (typeof result.stats === "object" && Array.isArray(result.stats.includedFiles))
			result.stats.includedFiles.forEach(file => {
				this.addDependency(file.replace(/\//g, path.sep));
			});

		callback(null, result.css, null);
	} catch (e) {
		e.hideStack = true;
		if (e.file) {
			if (e.file === "stdin") e.file = this.resourcePath;
			else e.file = path.normalize(e.file);
			e.message = e.message.replace(/\s*Current dir:\s*/, "") +
				"      in " + e.file + " (line " + e.line + ", column " + e.column + ")";
		}
		callback(e);
	}
};