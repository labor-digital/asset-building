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
 * Last modified: 2019.10.05 at 21:31
 */

import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {WorkerContext} from "../../../Core/WorkerContext";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class JsCompatConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		if (!isArray(context.app.jsCompat) || context.app.jsCompat.length === 0) return Promise.resolve(context);
		forEach(context.app.jsCompat, (config, k) => {
			// Validate
			if (typeof config !== "object") throw new Error("Invalid js compat configuration at key: " + k);
			if (typeof config.rule !== "string" || config.rule.trim().length === 0)
				throw new Error("Invalid or missing js compat \"rule\" at key: " + k);
			if (typeof config.fix !== "string" || config.fix.trim().length === 0)
				throw new Error("Invalid or missing js compat \"fix\" at key: " + k);

			// Add imports loader if fix misses it
			if (config.fix.indexOf("imports-loader?") !== 0) config.fix = "imports-loader?" + config.fix;

			// Add new module
			context.webpackConfig.module.rules.push({
				"test": new RegExp(config.rule),
				"loader": config.fix
			});
		});
	}
}