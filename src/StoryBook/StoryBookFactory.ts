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
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {Configuration} from "webpack";
import {AssetBuilderConfiguratorIdentifiers as Ids} from "../AssetBuilderConfiguratorIdentifiers";
import {AssetBuilderEventList} from "../AssetBuilderEventList";
import {Bootstrap} from "../Core/Bootstrap";
import {CoreContext} from "../Core/CoreContext";
import {WorkerContext} from "../Core/WorkerContext";
import {AppDefinitionInterface} from "../Interfaces/AppDefinitionInterface";
import {WebpackConfigGenerator} from "../Webpack/ConfigGeneration/WebpackConfigGenerator";

export class StoryBookFactory {
	/**
	 * The instance of the asset builder bootstrap class
	 */
	protected _bootstrap?: Bootstrap;

	/**
	 * Holds the core context instance after it was initialized
	 */
	protected _coreContext?: CoreContext;

	/**
	 * Holds either the given app configuration or an empty, plain object
	 */
	protected _appConfig: AppDefinitionInterface;

	public constructor(appConfig ?: AppDefinitionInterface | PlainObject) {
		this._appConfig = isUndefined(appConfig) ? {} as any : appConfig;
	}

	/**
	 * Returns the bootstrap instance of the asset builder
	 */
	public getBootstrap(): Bootstrap {
		if (!isUndefined(this._bootstrap)) return this._bootstrap;
		return this._bootstrap = new Bootstrap(true, {apps: [{...this._appConfig}]});
	}

	/**
	 * Returns the core context instance.
	 * You should only use this in development mode!
	 */
	public getCoreContext(): Promise<CoreContext> {
		if (!isUndefined(this._coreContext)) return Promise.resolve(this._coreContext);
		return this.getBootstrap()
			.initMainProcess(require("../../package.json"), process.cwd(), require("path").dirname(__dirname), "watch")
			.then(context => {
				this._coreContext = context;

				// Make sure we have a dummy entry file
				context.laborConfig.apps[0].entry = "./package.json";

				// Disable entry / output validation
				context.eventEmitter.bind(AssetBuilderEventList.FILTER_APP_DEFINITION_SCHEMA, (e) => {
					delete e.args.schema.output;
				});

				// Disable all not required configurator ids
				context.eventEmitter.bind(AssetBuilderEventList.FILTER_CONFIGURATOR, (e) => {
					const id = e.args.identifier;
					if ([Ids.BASE, Ids.APP_PATHS, Ids.PROGRESS_BAR_PLUGIN, Ids.HTML_LOADER,
						Ids.IMAGE_LOADER, Ids.FONT_LOADER, Ids.CSS_EXTRACT_PLUGIN,
						Ids.CLEAN_OUTPUT_DIR_PLUGIN, Ids.COPY_PLUGIN, Ids.MIN_CHUNK_SIZE_PLUGIN,
						Ids.BUNDLE_ANALYZER_PLUGIN, Ids.HTML_PLUGIN, Ids.JS_PRE_LOADER
					].indexOf(id) === -1) return;
					e.args.useConfigurator = false;
				});

				// Remove css extract loader
				context.eventEmitter.bind(AssetBuilderEventList.FILTER_LOADER_CONFIG, (e) => {
					const cssExtractorPluginRegex = new RegExp("mini-css-extract-plugin");
					// Register additional loader to strip out all /deep/ selectors we need for component nesting,
					// but that are not wanted in a browser environment
					if (e.args.identifier === Ids.SASS_LOADER ||
						e.args.identifier === Ids.LESS_LOADER) {
						forEach(e.args.config.use, (v, k) => {
							// Remove css extract plugin
							if (!isString(v.loader)) return;
							if (v.loader.match(cssExtractorPluginRegex)) {
								e.args.config.use.splice(k, 1);
								return false;
							}
						});
					}

				}, 5000);

				return context;
			});
	}

	/**
	 * Gets a worker context for a dummy application to configure story book with
	 */
	public getWorkerContext(): Promise<WorkerContext> {
		// Create the worker context
		return this.getCoreContext().then((context: CoreContext) => {
			return this.getBootstrap().initWorkerProcess({
				app: JSON.stringify(context.laborConfig.apps[0]),
				context: context.toJson()
			});
		});
	}

	/**
	 * Returns the webpack config that should be merged into the configuration of story book
	 */
	public enhanceWebpackConfig(rawConfig: Configuration): Promise<Configuration> {
		return this.getWorkerContext().then(context => {
			const moduleBackup = rawConfig.module.rules;
			const pluginBackup = rawConfig.plugins;

			// Set the default configuration provided by story book
			rawConfig.module.rules = [];
			rawConfig.plugins = [];
			context.webpackConfig = rawConfig;

			// Run the config generator
			return (new WebpackConfigGenerator()).generateConfiguration(context)
				.then(context => {
					// Make sure we correctly override existing rules
					const knownPatterns = [];
					forEach(context.webpackConfig.module.rules, (v) => {
						knownPatterns.push((v.test as RegExp) + "");
					});

					// Merge in the module backup if we don't have an override
					forEach(moduleBackup, (v) => {
						if (knownPatterns.indexOf((v.test as RegExp) + "") !== -1) return;
						context.webpackConfig.module.rules.push(v);
					});

					// Make sure we correctly override existing plugins
					const knownPlugins = [];
					forEach(context.webpackConfig.plugins, (v) => {
						knownPlugins.push(v.constructor.name + "");
					});

					// Merge in the plugin backup if we don't have an override
					forEach(pluginBackup, (v) => {
						if (knownPlugins.indexOf(v.constructor.name + "") !== -1) return;
						context.webpackConfig.plugins.push(v);
					});

					// Done
					return context.webpackConfig;
				});
		});
	}
}