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

import type {PlainObject} from '@labor-digital/helferlein';
import {forEach, isPlainObject, isString, isUndefined} from '@labor-digital/helferlein';
import type {Configuration} from 'webpack';
import type {CoreContext} from '../../Core/CoreContext';
import {Factory} from '../../Core/Factory';
import {EventList} from '../../EventList';
import {ConfiguratorIdentifier, LoaderIdentifier, PluginIdentifier} from '../../Identifier';
import type {IMakeEnhancedConfigActionOptions} from '../../Webpack/Actions/types';

export class StorybookFactory
{
    
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
    
    protected coreContextPromise?: Promise<CoreContext>;
    
    /**
     * Injects the factory instance and options
     * @param options
     * @param factory
     */
    public constructor(options: PlainObject, factory?: Factory)
    {
        this._options = options;
        this._factory = factory ?? new Factory();
    }
    
    /**
     * Allows us to create the core context early, so storybook can resolve all our node_modules
     */
    public initializeCoreContext(): Promise<CoreContext>
    {
        if (!isUndefined(this.coreContextPromise)) {
            return this.coreContextPromise;
        }
        return this.coreContextPromise = this._factory.makeCoreContext({
            mode: 'watch',
            environment: 'storyBook',
            additionalResolverPaths: (isPlainObject(this._options.app) ? this._options.app : {}) as any,
            ...(this._options.assetBuilder ?? {}),
            ...(isPlainObject(this._options.app) ? {app: this._options.app} : {})
        });
    }
    
    /**
     * Enhances the given storybook configuration with the config build by our asset builder logic
     * @param config
     */
    public async enhanceWebpackConfig(config: Configuration): Promise<Configuration>
    {
        const coreContext = await this.initializeCoreContext();
        
        // Recalculate the context properties when we have the configuration
        coreContext.isProd = config.mode !== 'development';
        coreContext.mode = coreContext.isProd ? 'build' : 'watch';
        
        const worker = await this._factory.makeWorkerContext(coreContext, coreContext.options!.apps![0]);
        return await worker.do.makeEnhancedConfig(config, this.getEnhancerOptions());
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
                ConfiguratorIdentifier.CSS_EXTRACT,
                ConfiguratorIdentifier.CLEAN_OUTPUT_DIR,
                ConfiguratorIdentifier.COPY,
                ConfiguratorIdentifier.MIN_CHUNK_SIZE,
                ConfiguratorIdentifier.BUNDLE_ANALYZER,
                PluginIdentifier.HTML_TEMPLATE,
                ConfiguratorIdentifier.JS_PRE,
                PluginIdentifier.GIT_ADD
            ],
            ruleFilter: test => {
                // The list of FORBIDDEN patterns that should NOT pass
                return [
                           '/\\.vue$/'
                       ].indexOf(test) === -1;
            },
            pluginFilter: test => {
                return [
                           'ProgressPlugin',
                           'VueLoaderPlugin'
                       ].indexOf(test) === -1;
            },
            events: {
                [EventList.FILTER_LOADER_CONFIG]: (e) => {
                    const cssExtractorPluginRegex = new RegExp('mini-css-extract-plugin');
                    if (e.args.identifier === LoaderIdentifier.SASS ||
                        e.args.identifier === LoaderIdentifier.LESS) {
                        forEach(e.args.config.use, (v, k) => {
                            if (!isString(v.loader)) {
                                return;
                            }
                            if (v.loader.match(cssExtractorPluginRegex)) {
                                e.args.config.use[k] = 'style-loader';
                                return false;
                            }
                        });
                    }
                }
            }
        };
    }
}