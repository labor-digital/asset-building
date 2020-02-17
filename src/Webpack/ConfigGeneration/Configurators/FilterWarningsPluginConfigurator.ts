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
 * Last modified: 2019.10.06 at 15:55
 */

import {map} from "@labor-digital/helferlein/lib/Lists/map";
import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import WebpackFilterWarningsPlugin from "webpack-filter-warnings-plugin";
import {AssetBuilderEventList} from "../../../AssetBuilderEventList";
import {WorkerContext} from "../../../Core/WorkerContext";
import {ConfiguratorInterface} from "./ConfiguratorInterface";

export class FilterWarningsPluginConfigurator implements ConfiguratorInterface {
	public apply(identifier: string, context: WorkerContext): Promise<WorkerContext> {
		// Get the warnings to ignore
		let warningsToIgnore: Array<string | RegExp> = (isArray(context.app.warningsIgnorePattern) ? context.app.warningsIgnorePattern : (
			isString(context.app.warningsIgnorePattern) ? [context.app.warningsIgnorePattern] : []
		)) as Array<any>;

		// Make sure everything is a regex
		warningsToIgnore = map(warningsToIgnore, (v, k) => {
			if (isString(v)) return new RegExp(v);
			return v;
		});

		// Add ard coded filters:
		// Caused by some sort of some non matching tree layout architecture doohickey o.O
		// We don't care, tho: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
		warningsToIgnore.push(/mini-css-extract-plugin[^]*Conflicting order between:/);

		// Allow filtering
		return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_WARNING_TO_IGNORE_PATTERNS, {
				patterns: warningsToIgnore,
				identifier,
				context
			})
			.then(args => {
				return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
					config: {
						exclude: args.patterns
					},
					identifier,
					context
				});
			})
			.then(args => {
				context.webpackConfig.plugins.push(new WebpackFilterWarningsPlugin(args.config));
				return context;
			});
	}
}