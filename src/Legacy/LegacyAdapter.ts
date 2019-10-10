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
 * Last modified: 2019.10.04 at 22:49
 */

import {forEach} from "@labor/helferlein/lib/Lists/forEach";
import {md5} from "@labor/helferlein/lib/Misc/md5";
import {escapeRegex} from "@labor/helferlein/lib/Strings/escapeRegex";
import {isArray} from "@labor/helferlein/lib/Types/isArray";
import {isUndefined} from "@labor/helferlein/lib/Types/isUndefined";
import fs from "fs";
import path from "path";
// noinspection ES6UnusedImports
import * as webpack from "webpack";
import {CoreContext} from "../Core/CoreContext";
import {WorkerContext} from "../Core/WorkerContext";
import {FileHelpers} from "../Helpers/FileHelpers";
import {AppCopyDefinition, AppDefinitionInterface} from "../Interfaces/AppDefinitionInterface";
import ToJsonOutput = webpack.Stats.ToJsonOutput;

export class LegacyAdapter {
	/**
	 * This helper takes the old config format and converts it into the new, app based config format
	 * so we can be sure every later plugin gets the same config structure
	 * @param coreContext
	 */
	static rewriteConfig(coreContext: CoreContext): Promise<CoreContext> {

		// Check if the config has data
		let hasCss = !isUndefined(coreContext.laborConfig.css) &&
			isArray(coreContext.laborConfig.css) && coreContext.laborConfig.css.length > 0;
		let hasJs = !isUndefined(coreContext.laborConfig.js) &&
			isArray(coreContext.laborConfig.js) && coreContext.laborConfig.js.length > 0;

		// Create a new app for each asset
		const apps = isArray(coreContext.laborConfig.apps) ? coreContext.laborConfig.apps : [];
		coreContext.laborConfig.apps = apps;
		let assetToAppConverter = function (key, config, isStyle) {
			if (typeof config.entry !== "string" || config.entry.trim().length === 0)
				throw new Error("Invalid or missing " + (isStyle ? "css" : "js") + " \"entry\" at key: " + key);
			if (typeof config.output !== "string" || config.output.trim().length === 0)
				throw new Error("Invalid or missing " + (isStyle ? "css" : "js") + " \"output\" at key: " + key);
			const setName = "setEntry-" + md5(config.entry);
			const entryFile = coreContext.workDirectoryPath + setName + ".js";
			const outputFile = coreContext.workDirectoryPath + "dist" + path.sep + setName + ".js";
			const entryFileReal = path.resolve(coreContext.sourcePath + config.entry);
			const entryFileRelative = path.relative(coreContext.workDirectoryPath, entryFileReal);
			fs.writeFileSync(entryFile, "module.exports = require( \"" + entryFileRelative.replace(/\\/g, "/") + "\");");

			// Create the new app
			apps.push({
				appName: "Legacy-App-" + (isStyle ? "css" : "js") + " - " + key,
				entry: path.relative(coreContext.sourcePath, entryFile),
				output: path.relative(coreContext.sourcePath, outputFile),
				warningsIgnorePattern: config.warningsIgnorePattern,
				webpackConfig: config.webpackConfig,
				_legacySetName: setName,
				_legacyStyle: isStyle,
				_legacyConfig: config
			});
		};
		if (hasCss)
			forEach(coreContext.laborConfig.css, (config, k) => assetToAppConverter(k, config, true));
		if (hasJs)
			forEach(coreContext.laborConfig.js, (config, k) => assetToAppConverter(k, config, false));

		// Remove legacy keys
		delete coreContext.laborConfig.js;
		delete coreContext.laborConfig.css;

		// Remap keys from global into the apps we create
		forEach(["verboseResult", "webpackConfig", "polyfills", "minChunkSize", "useTypeChecker", "jsCompat", "keepOutputDirectory", "disableGitAdd"], field => {
			if (typeof coreContext.laborConfig[field] === "undefined") return;
			forEach(apps, (app: AppDefinitionInterface) => {
				app[field] = coreContext.laborConfig[field];
			});
			delete coreContext.laborConfig[field];
		});

		// Create the copy apps if required
		LegacyAdapter.createCopyAppNodes(coreContext);

		// Done
		return Promise.resolve(coreContext);
	}

	/**
	 * Is used in the default compiler callback to apply additional operations
	 * that are required to simulate a version 2 builder context for version 1 assets
	 * @param stats
	 * @param context
	 */
	static statFilter(stats: ToJsonOutput, context: WorkerContext): ToJsonOutput {

		// Output filter ot override the filenames
		if (isUndefined(context.app._legacyConfig)) return stats;
		const isStyle = context.app._legacyStyle;

		// Rewrite output path
		const outputPath = stats.outputPath;
		stats.outputPath = path.resolve(context.parentContext.sourcePath);

		// Prepare replacements
		const setNamePattern = new RegExp("(.*?" + escapeRegex(context.app._legacySetName) + ")", "g");
		const setNameReplacement = FileHelpers.getFileWithoutExtension(context.app._legacyConfig.output);

		// Rewrite the assets
		stats.assets.forEach(asset => {
			// Store asset location
			const assetLocation = outputPath + path.sep + asset.name;

			// Rewrite every asset to be relative to the current working directory
			asset.name = asset.name.replace(setNamePattern, setNameReplacement);

			// Remove all .js root files in styles
			if (isStyle && asset.name.indexOf(setNameReplacement + ".js") === 0) {
				// Rewrite style-js files to "map" so we ignore them in the output
				asset.name = asset.name + ".map";
				return;
			}

			// Move file to real output directory
			const assetLocationReal = stats.outputPath + path.sep + asset.name;
			const assetLocationDirectory = path.dirname(assetLocationReal);
			try {
				FileHelpers.mkdir(assetLocationDirectory);
			} catch (e) {
				stats.errors.push("LEGACY ADAPTER: Failed to create the asset output directory at: \"" + assetLocationDirectory + "\"");
				return;
			}
			try {
				fs.copyFileSync(assetLocation, assetLocationReal);
			} catch (e) {
				console.log("Legacy output path: \"" + outputPath + "\"", (fs.existsSync(outputPath) ? "(Exists)" : "(Does not exist!)"));
				if (fs.existsSync(outputPath)) console.log("Legacy output contents: ", fs.readdirSync(outputPath));
				stats.errors.push("LEGACY ADAPTER: Failed to copy a temporary asset from: \"" + assetLocation + "\" to its destination at: \"" + assetLocationReal + "\"");
			}
		});
	}

	/**
	 * Creates the dummy apps for the copy plugin
	 */
	protected static createCopyAppNodes(coreContext: CoreContext) {
		// Check if we got work to do
		if (!Array.isArray(coreContext.laborConfig.copy)) return;

		// Create list storage
		const firstCopyList = [];
		const lastCopyList = [];

		// Gather the copy configuration entries
		coreContext.laborConfig.copy.forEach((config) => {
			if (config.first === true) firstCopyList.push(config);
			else lastCopyList.push(config);
		});

		// Create the dummy apps if required
		const appCreator = function (copyType: "first" | "last", copyList: Array<AppCopyDefinition>): AppDefinitionInterface {
			const setName = "setCopy-" + md5(Date.now().toString());
			fs.writeFileSync(coreContext.workDirectoryPath + setName + "-" + copyType + ".js", "let a=0;");

			// Create the new app
			return {
				appName: "Legacy-App-copy - " + copyType,
				entry: path.relative(coreContext.sourcePath, coreContext.workDirectoryPath + setName + "-" + copyType + ".js"),
				output: path.relative(coreContext.sourcePath, setName + "-" + copyType + ".js"),
				copy: copyList,
				disableGitAdd: true,
				_legacyCopy: true,
				_legacySetName: setName,
				_legacyConfig: copyList
			};
		};

		// Add the configuration to the app stack
		if (firstCopyList.length > 0) coreContext.laborConfig.apps.unshift(appCreator("first", firstCopyList));
		if (lastCopyList.length > 0) coreContext.laborConfig.apps.push(appCreator("last", lastCopyList));
	}
}