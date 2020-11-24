/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.04.23 at 20:11
 */

import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {Configuration} from "webpack";
import {AssetBuilderConfiguratorIdentifiers as Ids} from "../../AssetBuilderConfiguratorIdentifiers";
import {AssetBuilderEventList} from "../../AssetBuilderEventList";
import {AssetBuilderPluginIdentifiers} from "../../AssetBuilderPluginIdentifiers";
import {CoreContext} from "../../Core/CoreContext";
import {Factory} from "../../Core/Factory";
import {MakeEnhancedConfigActionOptions} from "../../Webpack/Actions/MakeEnhancedConfigAction.interfaces";

export class StorybookFactory {

	/**
	 * The story book module options to extract the app from
	 * @protected
	 */
	protected _options: PlainObject;

	/**
	 * The concrete factory to create the asset builder with
	 * @protected
	 */
	protected _factory: Factory;

	protected coreContextPromise: Promise<CoreContext>;

	/**
	 * Injects the factory instance and options
	 * @param factory
	 * @param options
	 */
	public constructor(options: PlainObject, factory?: Factory) {
		this._options = options;
		this._factory = factory ?? new Factory();
	}

	/**
	 * Allows us to create the core context early, so storybook can resolve all our node_modules
	 */
	public initializeCoreContext(): Promise<CoreContext> {
		if (!isUndefined(this.coreContextPromise)) return this.coreContextPromise;
		return this.coreContextPromise = this._factory.makeCoreContext({
			environment: "storyBook",
			laborConfig: isPlainObject(this._options.laborConfig) ? this._options.laborConfig : {}
		});
	}

	/**
	 * Enhances the given storybook configuration with the config build by our asset builder logic
	 * @param config
	 */
	public enhanceWebpackConfig(config: Configuration): Promise<Configuration> {
		return this.initializeCoreContext()
			.then(coreContext => {
					coreContext.mode = config.mode === "development" ? "watch" : "build";
					return this._factory.makeWorkerContext(coreContext, {
						app: this._options.app ?? {},
						noEntryOutputValidation: true
					});
				}
			)
			.then(workerContext => workerContext.do.makeEnhancedConfig(config, this.getEnhancerOptions()));
	}

	/**
	 * Provides the options for the makeEnhancedConfig method
	 * @protected
	 */
	protected getEnhancerOptions(): MakeEnhancedConfigActionOptions {
		return {
			disableConfigurators: [
				Ids.APP_PATHS,
				Ids.CSS_EXTRACT_PLUGIN,
				Ids.CLEAN_OUTPUT_DIR_PLUGIN,
				Ids.COPY_PLUGIN,
				Ids.MIN_CHUNK_SIZE_PLUGIN,
				Ids.BUNDLE_ANALYZER_PLUGIN,
				Ids.HTML_PLUGIN,
				Ids.JS_PRE_LOADER
			],
			disablePlugins: [
				AssetBuilderPluginIdentifiers.GIT_ADD
			],
			ruleFilter: test => {
				// The list of FORBIDDEN patterns that should NOT pass
				return [
					"/\\.vue$/"
				].indexOf(test) === -1;
			},
			pluginFilter: test => {
				return [
					"ProgressPlugin",
					"VueLoaderPlugin"
				].indexOf(test) === -1;
			},
			events: {
				[AssetBuilderEventList.FILTER_LOADER_CONFIG]: (e) => {
					const cssExtractorPluginRegex = new RegExp("mini-css-extract-plugin");
					if (e.args.identifier === Ids.SASS_LOADER ||
						e.args.identifier === Ids.LESS_LOADER) {
						forEach(e.args.config.use, (v, k) => {
							if (!isString(v.loader)) return;
							if (v.loader.match(cssExtractorPluginRegex)) {
								e.args.config.use[k] = "style-loader";
								return false;
							}
						});
					}
				}
			}
		};
	}
}