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
 * Last modified: 2019.02.05 at 13:48
 */

/**
 * Created by Martin Neundorfer on 05.02.2019.
 * For LABOR.digital
 */
const FileHelpers = require("../../Helpers/FileHelpers");
const loaderUtils = require("loader-utils");
module.exports = class BaseFileExtResolver {
	/**
	 *
	 * @param {module.SassFileResolverContext} context
	 */
	static getExtFor(context){
		const validExtensions = ["css", "sass", "scss"];
		context.baseExt = FileHelpers.getFileExtension(context.baseFile);
		if (validExtensions.indexOf(context.baseExt) === -1) {
			const q = loaderUtils.parseQuery(context.loader.resourceQuery);

			// Try to determine by "lang" type -> Works for vue.js
			if (typeof q.lang === "string" && validExtensions.indexOf(q.lang.trim().toLowerCase()) !== -1)
				context.baseExt = q.lang.trim().toLowerCase();

			// Still not? Check if we got help somewhere... /o\
			else {
				let alternativeExt = context.baseContext.allPluginMethod("customSassLoaderFileExtensionFallback",
					[context.baseExt, context.baseFile, context.loader.resourceQuery, context]);
				if (alternativeExt === context.baseExt)
					throw new Error("Error while parsing a file called: \"" + stylesheetPath + "\" the file's extension does not look like it is sass compatible!");
				context.baseExt = alternativeExt;
			}

			// Make sure our descendants know which file this is...
			context.baseFile += "." + context.baseExt;
		}
	}
};