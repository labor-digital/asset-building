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
 * Last modified: 2019.01.11 at 17:25
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const FileHelpers = require("../Helpers/FileHelpers");
const MiscHelpers = require("../Helpers/MiscHelpers");

let afterFilterPluginApplied = false;

module.exports = class CopyPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (!Array.isArray(context.laborConfig.copy) || context.laborConfig.copy.length === 0) return;

		let isCopy = typeof context.currentAppConfig['@isCopy'] !== 'undefined' && context.currentAppConfig['@isCopy'];
		let isFirst = typeof context.currentAppConfig['@copyOrder'] !== 'undefined' && context.currentAppConfig['@copyOrder'] === 'first';
		let isWatch = context.mode === "watch";

		if(!isCopy)	return;

		if(!afterFilterPluginApplied) {
			context.plugins.push({compilingDone: this._compilingDone});
			afterFilterPluginApplied = true;
		}

		let copyToAdd = [];

		context.laborConfig.copy.forEach(config => {
			let inFirst = typeof config['first'] !== 'undefined' && config['first'];
			if(isFirst ^ inFirst)
				return;

			let copyInBuildOnly = typeof config['inBuildOnly'] !== 'undefined' && config['inBuildOnly'];
			if(copyInBuildOnly && isWatch)
				return;

			copyToAdd.push(config);
		});

		if(!copyToAdd.length)	return;

		// Add the context to all configurations
		copyToAdd.forEach(config => {

			// Validate input
			if (typeof config.from === "undefined")
				throw new Error("Your copy configuration does not define a \"from\" key!");

			// Add context if required
			if (typeof config.context === "undefined") config.context = context.dir.current;

			// Check if we have to rewrite the "from" -> Array to string
			if (Array.isArray(config.from)) {
				var thisValue = config.from.shift();
				var jsonConfig = JSON.stringify(config);
				config.from.forEach(v => {
					var newConfig = JSON.parse(jsonConfig);
					newConfig.from = v;
					copyToAdd.push(newConfig);
				});
				config.from = thisValue;
			}
		});

		// Make sure we can resolve node modules
		copyToAdd.forEach(config => {
			// Remove all glob related stuff from the path
			let fromDirectory = path.dirname(config.from.replace(/\*.*?$/, ""));
			let fromPrefix = "";
			if (fromDirectory.length > 0 && !fs.existsSync(fromDirectory)) {
				for (let directory of [context.dir.nodeModules, context.dir.buildingNodeModules, context.dir.current]) {
					fromPrefix = directory;
					if (fs.existsSync(fromPrefix + fromDirectory)) break;
					fromPrefix = "";
				}
				config.from = fromPrefix + config.from;
			}
		});

		// Add copy plugin
		context.webpackConfig.plugins.push(new CopyWebpackPlugin(
			context.callPluginMethod("filterPluginConfig", [
				copyToAdd,
				"copyPlugin", context
			]),
			{ copyUnmodified: true }
		));
	}

	static _compilingDone(statsJson, context) {
		// Run trough all children
		statsJson.children.forEach(child => {
			// Prepare the context for app based execution
			let currentApp = parseInt(child.name);
			let currentAppConfig = context.laborConfig.apps[currentApp];

			if(typeof currentAppConfig['@isCopy'] === 'undefined' || !currentAppConfig['@isCopy'])
				return;

			const outputPath = child.outputPath;

			// Filter the js output files
			const setNamePattern = new RegExp("(.*?" + MiscHelpers.escapeRegex(currentAppConfig["@setName"]) + ")", "g");
			const childAssetsToRemove = child.assets.filter((child) => {
				return child.name.match(setNamePattern) !== null;
			});
			child.assets = child.assets.filter((child) => {
				return child.name.match(setNamePattern) === null;
			});

			// Rewrite the assets
			for(let i=0; i<childAssetsToRemove.length; i++)
			{
				const assetLocation = outputPath + path.sep + childAssetsToRemove[i].name;
				try {
					fs.unlinkSync(assetLocation);
				} catch (e) {
					child.errors.push("CopyPlugin->_compilingDone: Failed to unlink tmp file: \"" + assetLocation + "\"");
					return;
				}
			}
		});
	}
};