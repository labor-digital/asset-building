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
 * Last modified: 2018.12.14 at 17:17
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
const FileHelpers = require("../Helpers/FileHelpers");
module.exports = class AppPathes {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context){
		// Add the relative entry point
		if (typeof context.currentAppConfig.entry !== "string" || context.currentAppConfig.entry.trim() === "")
			throw new Error("Your app: \"" + context.currentApp + "\" misses an \"entry\" point node!");
		context.webpackConfig.entry = "." + path.sep + path.relative(context.dir.current, path.resolve(context.dir.current, context.currentAppConfig.entry));
		const inputDirectory = path.dirname(context.currentAppConfig.entry);

		// Add output definition
		if (typeof context.currentAppConfig.output !== "string" || context.currentAppConfig.output.trim() === "")
			throw new Error("Your app: \"" + context.currentApp + "\" misses an \"output\" node!");
		let outputDirectory = path.resolve(context.dir.current, context.currentAppConfig.output);
		let outputFile = path.basename(outputDirectory);
		let outputFileWithoutExtension = FileHelpers.getFileWithoutExtension(outputFile);
		outputDirectory = path.dirname(outputDirectory);
		context.webpackConfig = Object.assign({output: {}}, context.webpackConfig);
		context.webpackConfig.output.path = outputDirectory;
		context.webpackConfig.output.filename = outputFile;
		context.webpackConfig.output.chunkFilename = "js/" + outputFileWithoutExtension +
			(context.isProd ? "-[id]-[hash].js" : "-[id].js");

		// Autogenerate public path if non was given via configuration
		let publicPath = null;
		if (typeof context.currentAppConfig.publicPath !== "string" || context.currentAppConfig.publicPath.trim() === "") {
			let publicPathRoot = inputDirectory;
			if (path.basename(publicPathRoot) === "src")
				publicPathRoot = path.dirname(publicPathRoot);
			publicPathRoot = path.dirname(publicPathRoot);
			publicPath = path.relative(publicPathRoot, outputDirectory);
			publicPath = publicPath.replace("\\", "/");
			if (!publicPath.match(/^\.\//)) publicPath = "/" + publicPath;
			if (!publicPath.match(/\/$/)) publicPath += "/";
		} else {
			publicPath = context.currentAppConfig.publicPath;
		}

		// Don't set a public path for legacy configuration
		if(context.builderVersion === 1) return;

		context.webpackConfig.output.publicPath = publicPath;

		// Add dev public path if given
		if (context.isProd === false && typeof context.currentAppConfig.publicPathDev === "string"
			&& context.currentAppConfig.publicPathDev.trim() !== "")
			context.webpackConfig.output.publicPath = context.currentAppConfig.publicPathDev;

	}
};