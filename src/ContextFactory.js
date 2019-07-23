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
 * Last modified: 2018.12.20 at 19:36
 */

/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const ConfigBuilderContext = require("./Entities/ConfigBuilderContext");
const FileHelpers = require("./Helpers/FileHelpers");

module.exports = class ContextFactory {
	/**
	 * Factory to create the context object which is used to build the webpack config with
	 * @param {module.Dir} dir
	 * @return {module.ConfigBuilderContext}
	 */
	static createContext(dir) {
		// Check if we are in the correct directory
		if (!fs.existsSync(dir.packageJson))
			throw new Error("Could not find package.json at: \"" + dir.packageJson + "\"");

		// Load package json
		const packageJson = JSON.parse(fs.readFileSync(dir.packageJson).toString("utf-8"));
		if (typeof packageJson.labor === "undefined")
			throw new Error("There is no \"labor\" node inside your current package json!");

		// Create a new context
		const context = new ConfigBuilderContext(packageJson.labor, dir);
		context.builderVersion = typeof context.laborConfig.builderVersion === "undefined" ?
			1 : parseInt(context.laborConfig.builderVersion);

		// Run trough initialization steps
		ContextFactory._instantiatePlugins(dir, context);
		ContextFactory._findMode(context);
		ContextFactory._plugInLegacyAdapterIfRequired(context);
		context.callPluginMethod("filterLaborConfig", [context.laborConfig, context]);

		// Check if there are registered apps
		if (!Array.isArray(context.laborConfig.apps) || context.laborConfig.apps.length === 0)
			throw new Error("Whoops! It looks like you did not define any apps. Did you configure the package.json correctly?");

		// Done
		return context;
	}

	/**
	 * Instantiates the registered plugins
	 * @param {module.Dir} dir
	 * @param {module.ConfigBuilderContext} context
	 * @private
	 */
	static _instantiatePlugins(dir, context) {
		if (!Array.isArray(context.laborConfig.plugins) || context.laborConfig.plugins.length === 0) return;
		context.laborConfig.plugins.forEach(v => {
			let plugin = null;
			let pluginBaseName = path.basename(v);
			for (let basePath of [dir.buildingNodeModules, dir.nodeModules, dir.current]) {
				try {
					plugin = require(path.resolve(basePath, v));

					// Add additional lookup path for all plugin sources
					let parts = path.dirname(path.resolve(basePath, v)).split(path.sep);
					while (parts.length > 0) {
						const pl = parts.join(path.sep) + path.sep + "node_modules" + path.sep;
						if (fs.existsSync(pl)) {
							dir.additionalResolverPaths.add(pl);
							break;
						}
						parts.pop();
					}
					break;
				} catch (e) {
					if (e.toString().indexOf("find module") === -1 || e.toString().indexOf(pluginBaseName) === -1)
						throw new Error("Error while loading plugin: \"" + v + "\" | " + e.toString());
				}
			}
			if (plugin === null) throw new Error("Invalid plugin path given! Missing plugin: \"" + v + "\"");
			if (typeof plugin !== "function") throw new Error("The defined plugin: \"" + v + "\" isn't a function!");
			context.plugins.push(new plugin());
		});
	}

	/**
	 * Finds and validates the given mode we should build the config for
	 * @param {module.ConfigBuilderContext} context
	 * @private
	 */
	static _findMode(context) {

		// Check if mode was given mode
		const modes = context.callPluginMethod("getModes", [["watch", "build"]]);
		let mode = typeof process.argv[2] === "undefined" ? "" : process.argv[2];
		mode = context.callPluginMethod("getMode", [mode, modes, context]);
		if (mode === "") throw new Error("You did not transfer a mode parameter (e.g. build, watch) to the call!");

		// Validate modes
		if (modes.indexOf(mode) === -1)
			throw new Error("Invalid mode given: \"" + mode + "\", valid modes are: \"" + modes.join(", ") + "\"!");

		// Store the mode
		context.mode = mode;

		// Check if we are in production
		context.isProd = context.callPluginMethod("isProd", [mode === "build", mode]);
	}

	/**
	 * Plugs in the legacy adapter if builder version 1 is used
	 * @param {module.ConfigBuilderContext} context
	 * @private
	 */
	static _plugInLegacyAdapterIfRequired(context) {
		if (context.builderVersion !== 1) return;
		const LegacyAdapter = require("./LegacyAdapter");
		LegacyAdapter.rewriteLaborConfig(context);
	}

	/**
	 * There might be cases where there is acutally no webpack config involved, but we are
	 * running other tasks, like copying files e.g. in that case we create a dummy application
	 *
	 * @param {module.ConfigBuilderContext} context
	 * @private
	 */
	static _handleApplessConfiguration(context) {
		if (Array.isArray(context.laborConfig.apps) && context.laborConfig.apps.length !== 0) return;
		const tmpDirectory = context.dir.nodeModules + ".cache" + path.sep + "labor-dummy-app" + path.sep;
		FileHelpers.mkdir(tmpDirectory);
		FileHelpers.touch(tmpDirectory + "dummy.js");
		context.laborConfig.apps = [
			{
				"entry": path.relative(context.dir.current, tmpDirectory + "dummy.js"),
				"output": path.relative(context.dir.current, tmpDirectory + "dist" + path.sep + "dummy.js")
			}
		];
	}
};