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
 * Last modified: 2018.12.20 at 19:35
 */

/**
 * Created by Martin Neundorfer on 06.09.2018.
 * For LABOR.digital
 */
const path = require("path");

module.exports = class Dir {
	constructor(cwd, controllerDirectory) {
		/**
		 * The current working directory
		 * @type {string}
		 */
		this.current = cwd.replace(/\\\/$/g, "") + path.sep;

		/**
		 * The controller's directory
		 * @type {string}
		 */
		this.controller = controllerDirectory.replace(/\\\/$/g, "") + path.sep;

		/**
		 * The absolute path to the current base package's node modules
		 * @type {string}
		 */
		this.nodeModules = this.current + "node_modules" + path.sep;

		/**
		 * The absolute path to the asset-building's node modules
		 * @type {string}
		 */
		this.buildingNodeModules = path.resolve(this.controller, "../node_modules/") + path.sep;

		/**
		 * The absolute path to the base package's package.json
		 * @type {string}
		 */
		this.packageJson = this.current + "package.json";

		/**
		 * Is used to store additional paths that should be used for node and webpack file resolution
		 * in addition to the default node_modules directory
		 * @type {Set<any>}
		 */
		this.additionalResolverPaths = new Set();
		this.additionalResolverPaths.add(this.nodeModules);
		this.additionalResolverPaths.add(this.buildingNodeModules);
		this.additionalResolverPaths.add("node_modules" + path.sep);
		this.additionalResolverPaths.add(path.sep);
		this.additionalResolverPaths.add("." + path.sep);
	}
};