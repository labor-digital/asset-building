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

import {isUndefined} from '@labor-digital/helferlein';
import type {Configuration} from 'webpack';
import type {CoreContext} from '../../Core/CoreContext';
import {Factory} from '../../Core/Factory';
import type {IBuilderOptions} from '../../Core/types';
import {EventList} from '../../EventList';
import {ConfiguratorIdentifier, PluginIdentifier} from '../../Identifier';
import type {IMakeEnhancedConfigActionOptions} from '../../Webpack/Actions/types';

export class StorybookFactory
{
    
    /**
     * The story book module options to extract the app from
     * @protected
     */
    protected _options: IBuilderOptions;
    
    /**
     * The concrete factory to create the asset builder with
     * @protected
     */
    protected _factory: Factory;
    
    protected _coreContextPromise?: Promise<CoreContext>;
    
    /**
     * Injects the factory instance and options
     * @param options
     * @param factory
     */
    public constructor(options: IBuilderOptions, factory?: Factory)
    {
        this._options = options;
        this._factory = factory ?? new Factory();
    }
    
    /**
     * Allows us to create the core context early, so storybook can resolve all our node_modules
     */
    public initializeCoreContext(): Promise<CoreContext>
    {
        if (!isUndefined(this._coreContextPromise)) {
            return this._coreContextPromise;
        }
        return this._coreContextPromise = this._factory.makeCoreContext({
            app: {} as any,
            appEntryOutputValidation: false,
            ...this._options,
            environment: 'storyBook'
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
        coreContext.mode = coreContext.isProd ? 'production' : 'dev';
        
        const worker = await this._factory.makeWorkerContext(coreContext, coreContext.options!.apps![0]);
        return await worker.do.makeEnhancedConfig(config, this.getEnhancerOptions());
    }
    
    /**
     * Provides the options for the makeEnhancedConfig method
     * @protected
     */
    protected getEnhancerOptions(): IMakeEnhancedConfigActionOptions
    {
        let hasDefinePlugin = false;
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
                           '/\\.vue$/',
                           '/\\.css$/',
                           '/\\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\\?.*)?$/'
                
                       ].indexOf(test) === -1;
            },
            pluginFilter: (test) => {
                
                // Somehow Storybook registers the DefinePlugin twice :/ Therefore we will
                // remove the second one, to prevent warnings.
                if (test === 'DefinePlugin') {
                    if (hasDefinePlugin) {
                        return false;
                    }
                    hasDefinePlugin = true;
                }
                
                return [
                           'ProgressPlugin',
                           'VueLoaderPlugin'
                       ].indexOf(test) === -1;
            },
            events: {
                [EventList.FILTER_LAST_STYLE_LOADER]: e => {
                    e.args.loader = 'style-loader';
                }
            }
        };
    }
}