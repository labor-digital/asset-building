/*
 * Copyright 2021 LABOR.digital
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
 * Last modified: 2021.03.25 at 16:30
 */

import {isArray, PlainObject} from "@labor-digital/helferlein";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import type {WorkerContext} from "../../../Core/WorkerContext";
import type {ConfiguratorInterface} from "./ConfiguratorInterface";

export class PolyfillConfigurator implements ConfiguratorInterface {
	public async apply(_: string, context: WorkerContext): Promise<WorkerContext> {

		if (context.app.polyfills === false) return Promise.resolve(context);

		// Prepare the list of poly fills
		const polyfills = isArray(context.app.polyfills) ? context.app.polyfills : [];
		polyfills.push("core-js/features/promise/index.js");
		polyfills.push("core-js/features/set/index.js");
		polyfills.push("core-js/features/map/index.js");
		polyfills.push("core-js/features/object/assign.js");
		polyfills.push("core-js/features/object/entries.js");
		polyfills.push("core-js/features/object/keys.js");
		polyfills.push("core-js/features/array/from.js");
		polyfills.push("core-js/features/symbol/index.js");

		const args = await this.emitFilterEvent(polyfills, context);

		let entry = context.webpackConfig.entry;
		if (!isArray(entry)) {
			entry = [entry];
		}
		context.webpackConfig.entry = [...args.polyfills, ...entry];

		return Promise.resolve(context);
	}

	protected async emitFilterEvent(polyfills: Array<any>, context: WorkerContext): Promise<PlainObject> {
		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_POLYFILLS, {
			polyfills, context
		});
	}
}