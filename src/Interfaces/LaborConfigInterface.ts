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
 * Last modified: 2019.10.04 at 12:28
 */

import type {AppDefinitionInterface} from "./AppDefinitionInterface";

export interface LaborConfigInterface {
	/**
	 * Defines how this configuration object should be interpreted
	 * Can be either 1 or 2
	 */
	builderVersion?: number;

	/**
	 * By default the build processes / app definitions will be called async and in parallel. Which leads to much
	 * faster build times as webpack runs on separate threads.
	 *
	 * If you want the worker to run sequential (finish app 1, then start app 2, finish app 2 then start app 3...),
	 * you can set this to TRUE. This is TRUE by default for builderVersion 1 and FALSE by default for version 2.
	 */
	runWorkersSequential?: boolean;

	/**
	 * A list of configuration extensions that should be used on a global scale.
	 * The extension definition should be a file path that can be resolved by node.js.
	 * The extension should be a function that is exported as default.
	 * If the SAME extension is registered twice in the same list, or on global AND app scale,
	 * it will only be called ONCE!
	 */
	extensions?: Array<string>;

	/**
	 * The list of apps that is used in the configuration builder
	 */
	apps?: Array<AppDefinitionInterface>;

	/**
	 * Additional, configured lookup paths to find imports in
	 * These are used by require() to resolve node modules
	 */
	additionalResolverPaths?: Array<string>;

}