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
 * Last modified: 2019.02.18 at 18:40
 */

/**
 * Created by Martin Neundorfer on 13.12.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const FileHelpers = require("./Helpers/FileHelpers");
const MiscHelpers = require("./Helpers/MiscHelpers");

/**
 * This class is used to apply the required changes for configuration version 1 to
 * run in the context of config builder version 2.
 *
 * This is done by converting all registered assets into single pseudo "apps" that then well be compiled using
 * webpacks multi compiler
 */
module.exports = class LegacyAdapter {
	/**
	 * This helper takes the old config format and converts it into the new, app based config format
	 * so we can be sure every later plugin gets the same config structure
	 * @param {module.ConfigBuilderContext} context
	 */
	static rewriteLaborConfig(context) {

		// Create a work directory
		const tmpDirectory = context.dir.nodeModules + ".cache" + path.sep + "labor-legacy-code-cache" + path.sep;
		FileHelpers.mkdir(tmpDirectory);

		// Check if the config has data
		let hasCss = typeof context.laborConfig.css !== "undefined" && Array.isArray(context.laborConfig.css) && context.laborConfig.css.length > 0;
		let hasJs = typeof context.laborConfig.js !== "undefined" && Array.isArray(context.laborConfig.js) && context.laborConfig.js.length > 0;

		// Create a new app for each asset
		const apps = [];
		let assetToAppConverter = function (config, isStyle) {
			if (typeof config.entry !== "string" || config.entry.trim().length === 0)
				throw new Error("Invalid or missing " + (isStyle ? "css" : "js") + " \"entry\" at key: " + k);
			if (typeof config.output !== "string" || config.output.trim().length === 0)
				throw new Error("Invalid or missing " + (isStyle ? "css" : "js") + " \"output\" at key: " + k);
			const setName = "setEntry-" + MiscHelpers.md5(config.entry);
			const entryFile = tmpDirectory + setName + ".js";
			const outputFile = tmpDirectory + "dist" + path.sep + setName + ".js";
			const entryFileReal = path.resolve(context.dir.current + config.entry);
			const entryFileRelative = path.relative(tmpDirectory, entryFileReal);
			fs.writeFileSync(entryFile, "import \"" + entryFileRelative.replace(/\\/g, "/") + "\";");
			apps.push({
				"entry": path.relative(context.dir.current, entryFile),
				"output": path.relative(context.dir.current, outputFile),
				"@setName": setName,
				"@isStyle": isStyle,
				"@legacy": config
			})
		};
		if (hasCss) context.laborConfig.css.forEach(config => assetToAppConverter(config, true));
		if (hasJs) context.laborConfig.js.forEach(config => assetToAppConverter(config, false));

		// Remove legacy keys
		delete context.laborConfig.js;
		delete context.laborConfig.css;

		// Remap keys from global into the apps we create
		["polyfills", "minChunkSize", "useTypeChecker", "jsCompat", "keepOutputDirectory", "environment", "disableGitAdd"].forEach(field => {
			if(typeof context.laborConfig[field] === "undefined") return;
			apps.forEach(app => app[field] = context.laborConfig[field]);
			delete context.laborConfig[field];
		});

		// Inject new apps entry
		if (!Array.isArray(context.laborConfig.apps)) context.laborConfig.apps = [];
		context.laborConfig.apps = context.laborConfig.apps.concat(apps);
	}

	/**
	 * Injects additional plugins to handle additional changes that are required for version 1 to
	 * run propperly in the version 2 context
	 * @param {*} child
	 * @param {module.ConfigBuilderContext} context
	 */
	static childFilter(child, context) {

		// Output filter ot override the filenames
		const appConfig = context.laborConfig.apps[context.currentApp];
		if (typeof appConfig["@legacy"] === "undefined") return child;
		const isStyle = appConfig["@isStyle"];

		// Rewrite output path
		const outputPath = child.outputPath;
		child.outputPath = path.resolve(context.dir.current);

		// Prepare replacements
		const setNamePattern = new RegExp("(.*?" + MiscHelpers.escapeRegex(appConfig["@setName"]) + ")", "g");
		const setNameReplacement = FileHelpers.getFileWithoutExtension(appConfig["@legacy"].output);

		// Rewrite the assets
		child.assets.forEach(asset => {
			// Store asset location
			const assetLocation = outputPath + path.sep + asset.name;

			// Rewrite every asset to be relative to the current working directory
			asset.name = asset.name.replace(setNamePattern, setNameReplacement);

			// Remove all .js root files in styles
			if(isStyle && asset.name.indexOf(setNameReplacement + ".js") === 0){
				// Rewrite style-js files to "map" so we ignore them in the output
				asset.name = asset.name + ".map";
				return;
			}

			// Move file to real output directory
			const assetLocationReal = child.outputPath + path.sep + asset.name;
			const assetLocationDirectory = path.dirname(assetLocationReal);
			FileHelpers.mkdir(assetLocationDirectory);
			fs.copyFileSync(assetLocation, assetLocationReal);
			console.log(asset.name, assetLocationReal);

		});
	}
};