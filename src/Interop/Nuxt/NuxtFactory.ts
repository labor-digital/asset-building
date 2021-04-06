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
 * Last modified: 2020.10.21 at 12:05
 */

import {
    cloneList,
    EventEmitterEvent,
    forEach,
    isArray,
    isNumber,
    isString,
    PlainObject
} from '@labor-digital/helferlein';
import path from 'path';
import type {Configuration} from 'webpack';
import {isPlainObject} from 'webpack-merge/dist/utils';
import type {CoreContext} from '../../Core/CoreContext';
import {Factory} from '../../Core/Factory';
import type {IAppDefinition} from '../../Core/types';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import {ConfiguratorIdentifier, LoaderIdentifier, PluginIdentifier, RuleIdentifier} from '../../Identifier';
import type {IMakeEnhancedConfigActionOptions} from '../../Webpack/Actions/types';

export class NuxtFactory
{
    
    /**
     * The nuxt module options to extract the app from
     * @protected
     */
    protected _options: PlainObject;
    
    /**
     * The concrete factory to create the asset builder with
     * @protected
     */
    protected _factory: Factory;
    
    /**
     * Injects the factory instance and options
     * @param factory
     * @param options
     */
    public constructor(options: PlainObject, factory?: Factory)
    {
        throw new Error('This feature is currently not usable!');
        this._options = options;
        this._factory = factory ?? new Factory();
    }
    
    /**
     * Generates the enhanced webpack configuration and returns the modified configs array
     * @param configs
     */
    public enhanceWebpackConfigs(configs: Array<Configuration>): Promise<Array<Configuration>>
    {
        return this._factory.makeCoreContext({
            mode: configs[0].mode === 'production' ? 'production' : 'dev',
            environment: 'nuxt',
            appEntryOutputValidation: false
            // @todo this has to be fixed!
            // laborConfig: isPlainObject(this._options.laborConfig) ? this._options.laborConfig : {}
        }).then(coreContext => Promise.all([
            this.makeEnhancedConfig('client', configs, coreContext),
            this.makeEnhancedConfig('server', configs, coreContext)
        ])).then(() => configs);
    }
    
    /**
     * Used to enhance the given configs array by building our own webpack config and re-injecting
     * it back into the given "configs" array.
     *
     * @param type The type of the configuration to modify (mostly: server/client)
     * @param configs The list of nuxt webpack configurations to enhance
     * @param coreContext the core context instance to inherit the worker context from
     * @protected
     */
    protected async makeEnhancedConfig(
        type: string,
        configs: Array<Configuration>,
        coreContext: CoreContext
    ): Promise<void>
    {
        
        // Find the correct configuration based on the given type
        let config: Configuration | null = null;
        let key: number | null = null;
        forEach(configs, (c: Configuration, k) => {
            if (c.name === type) {
                config = c;
                key = k;
                return false;
            }
        });
        
        if (config === null || key === null) {
            return Promise.reject(new Error('Could not find ' + type + ' configuration!'));
        }
        
        // Build the enhanced configuration
        const worker = await this._factory.makeWorkerContext(coreContext, this.makeAppDefinition(type, config));
        const enhancedConfig = await worker.do.makeEnhancedConfig(config!, this.getEnhancerOptions());
        configs[key!] = await this.applyAdditionalServerConfiguration(type, enhancedConfig, worker);
    }
    
    /**
     * Provides the options for the makeEnhancedConfig method
     * @protected
     */
    protected getEnhancerOptions(): IMakeEnhancedConfigActionOptions
    {
        return {
            disable: [
                ConfiguratorIdentifier.APP_PATHS,
                ConfiguratorIdentifier.CLEAN_OUTPUT_DIR,
                ConfiguratorIdentifier.MIN_CHUNK_SIZE,
                ConfiguratorIdentifier.BUNDLE_ANALYZER,
                PluginIdentifier.HTML_TEMPLATE,
                ConfiguratorIdentifier.DEV_ONLY,
                PluginIdentifier.FANCY_STATS
            ],
            ruleFilter: test => {
                // The list of allowed patterns that should pass
                return [
                           '/\\.vue$/i',
                           '/\\.pug$/i',
                           '/\\.p(ost)?css$/i',
                           '/\\.styl(us)?$/i',
                           '/\\.(webm|mp4|ogv)$/i'
                       ].indexOf(test) !== -1;
            },
            events: {
                [EventList.FILTER_RULE_CONFIG]: (e) => {
                    switch (e.args.identifier) {
                        case RuleIdentifier.SASS:
                        case RuleIdentifier.LESS:
                            return this.modifyStyleLoader(e);
                    }
                },
                [EventList.FILTER_POSTCSS_PLUGINS]: (e) => {
                    const context = e.args.context;
                    if (!context.isProd) {
                        e.args.plugins.push(require('cssnano'));
                    }
                },
                [EventList.FILTER_LOADER_CONFIG]: (e) => {
                    if (e.args.identifier !== LoaderIdentifier.TS) {
                        return;
                    }
                    
                    e.args.options.compilerOptions.jsxFactory = 'h';
                    
                    // We adjust the typescript options here to match
                    // https://github.com/nuxt/typescript/blob/master/packages/typescript-build/src/index.ts#L65
                    // and
                    // https://typescript.nuxtjs.org/guide/setup.html#configuration
                    // because otherwise we had problems with some other modules...
                    const context: WorkerContext = e.args.context;
                    e.args.options = {
                        configFile: e.args.options.configFile.replace(/tsconfig\.json$/, 'tsconfig.nuxt.json'),
                        transpileOnly: !(context.app.useTypeChecker === true)
                    };
                }
            }
        };
    }
    
    /**
     * Modify the style loader to match the vue.js requirements
     * @param e
     * @protected
     */
    protected modifyStyleLoader(e: EventEmitterEvent): void
    {
        const cssExtractorPluginRegex = new RegExp('mini-css-extract-plugin');
        
        const worker: WorkerContext = e.args.context;
        
        // Register additional loader to strip out all /deep/ selectors we need for component nesting,
        // but that are not wanted in a browser environment
        const deepRemoverPath = path.resolve(
            worker.parentContext.paths.assetBuilder,
            '/dist/Webpack/Loaders/DeepRemover/DeepRemoverLoader.js'
        );
        // @todo this can be done better now, look at vue-extension
        e.args.config.use.forEach((v: any, k: any) => {
            if (typeof v === 'string') {
                v = {loader: v};
            }
            if (typeof v.loader === 'undefined') {
                return;
            }
            
            // Inject the loader
            if (v.loader.match(cssExtractorPluginRegex)) {
                const before = e.args.config.use.slice(0, k + 1);
                const after = e.args.config.use.slice(k + 1);
                e.args.config.use = [
                    ...before,
                    deepRemoverPath,
                    ...after
                ];
            }
        });
        
        // Rewrite sass and less loader
        const cssLoaderRegex = /^css-loader/;
        e.args.config.use.forEach((v: any, k: any) => {
            if (typeof v === 'string') {
                v = {loader: v};
            }
            if (typeof v.loader === 'undefined') {
                return;
            }
            
            // Update css-loader options
            // @see https://github.com/vuejs/vue-style-loader/issues/46#issuecomment-670624576
            if (v.loader.match(cssLoaderRegex) && isPlainObject(e.args.config.use[k].options)) {
                e.args.config.use[k].options.esModule = false;
            }
            
            // Inject vue style loader
            if (v.loader.match(cssExtractorPluginRegex)) {
                e.args.config.use[k] = 'vue-style-loader';
            }
        });
    }
    
    /**
     * Makes the prepared app configuration for the asset builder to generate the webpack config for.
     * @param type Either "client" or "server" depending on which config we should build the app for
     * @param config The webpack configuration to extract the entry point from
     * @protected
     */
    protected makeAppDefinition(type: string, config: Configuration): IAppDefinition
    {
        const app: IAppDefinition = (
            isPlainObject(this._options.app) ? cloneList(this._options.app) : {}
        ) as any;
        
        if (!isString(app.appName)) {
            app.appName = 'NUXT App';
        }
        
        if (!isNumber(app.id)) {
            app.id = 0;
        }
        
        app.keepOutputDirectory = true;
        app.disableGitAdd = true;
        
        // Find the correct entry file
        forEach(isArray((config.entry as any).app)
            ? (config.entry as any).app
            : config.entry as any, entryFile => {
            if (entryFile.match(new RegExp('.*?[\\\\/].nuxt[\\\\/]' + type + '.js$'))) {
                app.entry = entryFile;
                return false;
            }
        });
        
        // Make server definition
        if (type === 'server') {
            app.id += 1000;
            app.minChunkSize = 999999999;
            app.polyfills = false;
        }
        
        return app;
    }
    
    /**
     * Applys additional setup for the server webpack configuration
     * @param type
     * @param config
     * @param context
     * @protected
     */
    protected applyAdditionalServerConfiguration(
        type: string,
        config: Configuration,
        context: WorkerContext
    ): Promise<Configuration>
    {
        if (type !== 'server') {
            return Promise.resolve(config);
        }
        
        // To be able to use files from other node_modules that may be included without an extension
        // we have to modify the node externals plugin of nuxt.
        // Sadly there is no "good" way of enhancing the allow-list pattern.
        // Therefore we just kick the plugin and reinject it using our own config.
        // I only hope that we can rely on the fact that the first array entry is always the nuxt plugin /o\
        if (!isArray(config.externals)) {
            return Promise.resolve(config);
        }
        
        // Remove the externals plugin of nuxt
        // @todo why do we have this?
        // const filteredExternals = [];
        // forEach(config.externals as Array<any>, (external) => {
        // 	if (isFunction(external) && external.toString().indexOf("mark this module as external") !== false) {
        // 		return;
        // 	}
        // });
        // config.externals = filteredExternals;
        config.externals = [];
        
        // Allow to filter the extension pattern and inject the new instance of the plugin
        return context.eventEmitter.emitHook(EventList.INTEROP_VUE_EXTERNAL_EXTENSION_PATTERN,
            {pattern: /\.jso?n?$/i})
                      .then(args => args.pattern)
                      .then((pattern: RegExp) => {
                          (config.externals as Array<any>).unshift(
                              require('webpack-node-externals')({
                                  allowlist: (modulePath: string): boolean => {
                                      try {
                                          return !(require.resolve(modulePath) + '').match(pattern);
                                      } catch (e) {
                                          return true;
                                      }
                                  }
                              })
                          );
                          return config;
                      });
    }
}