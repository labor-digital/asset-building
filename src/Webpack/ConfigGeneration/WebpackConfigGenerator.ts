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
 * Last modified: 2019.10.05 at 15:16
 */


import {isFunction, isPlainObject, isString, isUndefined} from '@labor-digital/helferlein';
import isDocker from 'is-docker';
import path from 'path';
import {merge} from 'webpack-merge';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import {ConfiguratorIdentifier as Id} from '../../Identifier';
import {AppPathConfigurator} from './Configurators/AppPathConfigurator';
import {BaseConfigurator} from './Configurators/BaseConfigurator';
import {BuiltInPluginConfigurator} from './Configurators/BuiltInPluginConfigurator';
import {BundleAnalyzerConfigurator} from './Configurators/BundleAnalyzerConfigurator';
import {CleanOutputDirConfigurator} from './Configurators/CleanOutputDirConfigurator';
import {CopyConfigurator} from './Configurators/CopyConfigurator';
import {CssExtractConfigurator} from './Configurators/CssExtractConfigurator';
import {DevOnlyConfigurator} from './Configurators/DevOnlyConfigurator';
import {FilterWarningsConfigurator} from './Configurators/FilterWarningsConfigurator';
import {FontConfigurator} from './Configurators/FontConfigurator';
import {HtmlConfigurator} from './Configurators/HtmlConfigurator';
import {ImageConfigurator} from './Configurators/ImageConfigurator';
import {JsCompatConfigurator} from './Configurators/JsCompatConfigurator';
import {JsPreloadConfigurator} from './Configurators/JsPreloadConfigurator';
import {LessConfigurator} from './Configurators/LessConfigurator';
import {MinChunkSizeConfigurator} from './Configurators/MinChunkSizeConfigurator';
import {PolyfillConfigurator} from './Configurators/PolyfillConfigurator';
import {ProdOnlyConfigurator} from './Configurators/ProdOnlyConfigurator';
import {ProgressBarConfigurator} from './Configurators/ProgressBarConfigurator';
import {ProvideConfigurator} from './Configurators/ProvideConfigurator';
import {SassConfigurator} from './Configurators/SassConfigurator';
import {TypescriptConfigurator} from './Configurators/TypescriptConfigurator';
import type {IConfigurator} from './types';

export class WebpackConfigGenerator
{
    
    /**
     * Generates the webpack configuration object based on the given context
     * @param context
     */
    public async generateConfiguration(context: WorkerContext): Promise<WorkerContext>
    {
        const w = this.configuratorWrapper;
        
        // Apply the configurators on the context object
        await w(Id.BASE, context, new BaseConfigurator());
        await w(Id.APP_PATHS, context, new AppPathConfigurator());
        await w(Id.POLYFILL, context, new PolyfillConfigurator());
        await w(Id.PROGRESS_BAR, context, new ProgressBarConfigurator());
        await w(Id.HTML, context, new HtmlConfigurator());
        await w(Id.IMAGES, context, new ImageConfigurator());
        await w(Id.FONTS, context, new FontConfigurator());
        await w(Id.JS_PRE, context, new JsPreloadConfigurator());
        await w(Id.TS, context, new TypescriptConfigurator());
        await w(Id.JS_COMPAT, context, new JsCompatConfigurator());
        await w(Id.LESS, context, new LessConfigurator());
        await w(Id.SASS, context, new SassConfigurator());
        await w(Id.CSS_EXTRACT, context, new CssExtractConfigurator());
        await w(Id.PROVIDE, context, new ProvideConfigurator());
        await w(Id.COPY, context, new CopyConfigurator());
        await w(Id.CLEAN_OUTPUT_DIR, context, new CleanOutputDirConfigurator());
        await w(Id.MIN_CHUNK_SIZE, context, new MinChunkSizeConfigurator());
        await w(Id.FILTER_WARNINGS, context, new FilterWarningsConfigurator());
        await w(Id.DEV_ONLY, context, new DevOnlyConfigurator());
        await w(Id.PROD_ONLY, context, new ProdOnlyConfigurator());
        await w(Id.BUNDLE_ANALYZER, context, new BundleAnalyzerConfigurator());
        await w(Id.BUILT_IN_PLUGIN, context, new BuiltInPluginConfigurator());
        
        // Allow filtering
        await context.eventEmitter.emitHook(EventList.APPLY_EXTENSION_WEBPACK_CONFIG, {context});
        
        // Add the additional webpack config
        await this.mergeAdditionalConfig(context);
        
        // Check if we are running in docker and having to watch for changes -> Enable polling
        if (context.webpackConfig.watch && isDocker()) {
            if (isUndefined(context.webpackConfig.watchOptions)) {
                context.webpackConfig.watchOptions = {};
            }
            context.webpackConfig.watchOptions.poll = 600;
        }
        
        await context.eventEmitter.emitHook(EventList.FILTER_WEBPACK_CONFIG, {context});
        
        return context;
    }
    
    /**
     * Internal helper that wraps a single configurator and allows the disabling of specific configuration
     * steps
     * @param identifier
     * @param context
     * @param configurator
     */
    protected async configuratorWrapper(
        identifier: string,
        context: WorkerContext,
        configurator: IConfigurator
    ): Promise<void>
    {
        let args = await context.eventEmitter.emitHook(EventList.CHECK_IDENTIFIER_STATE, {
            identifier, configurator, enabled: true, context
        });
        
        if (!args.enabled) {
            return;
        }
        
        args = await context.eventEmitter.emitHook(EventList.BEFORE_CONFIGURATOR, {
            identifier, configurator: args.configurator, context
        });
        
        await args.configurator.apply(args.context);
        
        await context.eventEmitter.emitHook(EventList.AFTER_CONFIGURATOR, {identifier, context});
    }
    
    /**
     * Internal helper to load the additional webpack config file which may have been added
     * to the app definition
     * @param context
     */
    protected async mergeAdditionalConfig(context: WorkerContext): Promise<void>
    {
        // Ignore if there is no webpack config
        if (isUndefined(context.app.webpackConfig)) {
            return;
        }
        
        // Check if we got an object
        if (isPlainObject(context.app.webpackConfig)) {
            context.webpackConfig = merge(context.webpackConfig, context.app.webpackConfig as any);
            return;
        }
        
        // Check if we got true -> webpack.config.js in the source directory
        if (context.app.webpackConfig === true) {
            context.app.webpackConfig = './webpack.config.js';
        }
        
        // Check if we got a reference
        if (isString(context.app.webpackConfig)) {
            const customWebpackConfigPath =
                path.resolve(context.parentContext.paths.source, (context.app.webpackConfig as string));
            
            try {
                const customWebpackConfig = require(customWebpackConfigPath);
                if (isPlainObject(customWebpackConfig)) {
                    context.webpackConfig = merge(context.webpackConfig, customWebpackConfig);
                    return;
                }
                
                if (isFunction(customWebpackConfig)) {
                    context.eventEmitter.unbindAll(EventList.CUSTOM_WEBPACK_CONFIG_LOADING);
                    context.eventEmitter.bind(EventList.CUSTOM_WEBPACK_CONFIG_LOADING,
                        () => customWebpackConfig(context));
                    await context.eventEmitter.emitHook(EventList.CUSTOM_WEBPACK_CONFIG_LOADING, {});
                    return;
                }
                
                throw new Error(
                    'The default export of ' + customWebpackConfigPath + ' has to be an object or a function!');
                
            } catch (e) {
                throw new Error(
                    'Could not resolve the custom webpack config at: "' + customWebpackConfigPath + '". \n' +
                    'The following error occured: ' + e);
            }
        }
        
        throw new Error('Could not load the configured custom webpack config!');
    }
}