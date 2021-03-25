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
 * Last modified: 2019.10.05 at 15:23
 */

import path from "path";
import {merge} from "webpack-merge";
import type {WorkerContext} from "../../../Core/WorkerContext";
import {FileHelpers} from "../../../Helpers/FileHelpers";
import type {ConfiguratorInterface} from "./ConfiguratorInterface";

export class AppPathConfigurator implements ConfiguratorInterface {
	apply(_: string, context: WorkerContext): Promise<WorkerContext> {
		// Add the relative entry point
		context.webpackConfig.entry = "." + path.sep + path.relative(
			context.parentContext.sourcePath, path.resolve(context.parentContext.sourcePath, context.app.entry));
		const inputDirectory = path.dirname(context.app.entry);

		// Add output definition
		let outputDirectory = path.resolve(context.parentContext.sourcePath, context.app.output);
		let outputFile = path.basename(outputDirectory);
		let outputFileWithoutExtension = FileHelpers.getFileWithoutExtension(outputFile);
		outputDirectory = path.dirname(outputDirectory);
		context.webpackConfig = merge({output: {}}, context.webpackConfig);
		context.webpackConfig.output.path = outputDirectory;
		context.webpackConfig.output.filename = outputFile;
		context.webpackConfig.output.chunkFilename = "js/" + outputFileWithoutExtension +
			(context.isProd ? "-[id]-[fullhash].js" : "-[id].js");

		// Automatically generate public path if non was given via configuration
		let publicPath;
		if (typeof context.app.publicPath !== "string" || context.app.publicPath.trim() === "") {
			let publicPathRoot = inputDirectory;
			if (path.basename(publicPathRoot) === "src")
				publicPathRoot = path.dirname(publicPathRoot);
			publicPathRoot = path.dirname(publicPathRoot);
			publicPath = path.relative(publicPathRoot, outputDirectory);
			publicPath = publicPath.replace("\\", "/");
			if (!publicPath.match(/^\.\//)) publicPath = "/" + publicPath;
			if (!publicPath.match(/\/$/)) publicPath += "/";
		} else {
			publicPath = context.app.publicPath;
		}

		context.webpackConfig.output.publicPath = publicPath;

		// Add dev public path if given
		if (!context.isProd && typeof context.app.publicPathDev === "string"
			&& context.app.publicPathDev.trim() !== "")
			context.webpackConfig.output.publicPath = context.app.publicPathDev;

		// Done
		return Promise.resolve(context);
	}
}