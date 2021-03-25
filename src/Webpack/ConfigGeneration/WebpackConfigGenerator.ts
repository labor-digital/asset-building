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


import {isEmpty, isFunction, isPlainObject, isString, isUndefined} from '@labor-digital/helferlein';
import isDocker from 'is-docker';
import path from 'path';
import {merge} from 'webpack-merge';
import {AssetBuilderConfiguratorIdentifiers as Ids} from '../../AssetBuilderConfiguratorIdentifiers';
import {AssetBuilderEventList} from '../../AssetBuilderEventList';
import type {WorkerContext} from '../../Core/WorkerContext';
import {AppPathConfigurator} from './Configurators/AppPathConfigurator';
import {BaseConfigurator} from './Configurators/BaseConfigurator';
import {BuiltInPluginConfigurator} from './Configurators/BuiltInPluginConfigurator';
import {BundleAnalyzerPluginConfigurator} from './Configurators/BundleAnalyzerPluginConfigurator';
import {CleanOutputDirPluginConfigurator} from './Configurators/CleanOutputDirPluginConfigurator';
import type {ConfiguratorInterface} from './Configurators/ConfiguratorInterface';
import {CopyPluginConfigurator} from './Configurators/CopyPluginConfigurator';
import {CssExtractPluginConfigurator} from './Configurators/CssExtractPluginConfigurator';
import {DevOnlyConfigurator} from './Configurators/DevOnlyConfigurator';
import {FilterWarningsPluginConfigurator} from './Configurators/FilterWarningsPluginConfigurator';
import {FontLoaderConfigurator} from './Configurators/FontLoaderConfigurator';
import {HtmlLoaderConfigurator} from './Configurators/HtmlLoaderConfigurator';
import {HtmlPluginConfigurator} from './Configurators/HtmlPluginConfigurator';
import {ImageLoaderConfigurator} from './Configurators/ImageLoaderConfigurator';
import {JsCompatConfigurator} from './Configurators/JsCompatConfigurator';
import {JsPreloadConfigurator} from './Configurators/JsPreloadConfigurator';
import {LessLoaderConfigurator} from './Configurators/LessLoaderConfigurator';
import {MinChunkSizePluginConfigurator} from './Configurators/MinChunkSizePluginConfigurator';
import {PolyfillConfigurator} from './Configurators/PolyfillConfigurator';
import {ProdOnlyConfigurator} from './Configurators/ProdOnlyConfigurator';
import {ProgressBarPluginConfigurator} from './Configurators/ProgressBarPluginConfigurator';
import {ProvidePluginConfigurator} from './Configurators/ProvidePluginConfigurator';
import {SassLoaderConfigurator} from './Configurators/SassLoaderConfigurator';
import {TypescriptLoaderConfigurator} from './Configurators/TypescriptLoaderConfigurator';

export class WebpackConfigGenerator
{
    
    /**
     * Generates the webpack configuration object based on the given context
     * @param context
     */
    public generateConfiguration(context: WorkerContext): Promise<WorkerContext>
    {
        // Apply the configurators on the context object
        return Promise.resolve(context)
                      .then(context => this.configuratorWrapper(Ids.BASE, context, new BaseConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.APP_PATHS, context, new AppPathConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.POLYFILL, context, new PolyfillConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.PROGRESS_BAR_PLUGIN, context,
                          new ProgressBarPluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.HTML_LOADER, context, new HtmlLoaderConfigurator()))
                      .then(
                          context => this.configuratorWrapper(Ids.IMAGE_LOADER, context, new ImageLoaderConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.FONT_LOADER, context, new FontLoaderConfigurator()))
                      .then(
                          context => this.configuratorWrapper(Ids.JS_PRE_LOADER, context, new JsPreloadConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.TYPESCRIPT_LOADER, context,
                          new TypescriptLoaderConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.JS_COMPAT_LOADER, context,
                          new JsCompatConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.LESS_LOADER, context, new LessLoaderConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.SASS_LOADER, context, new SassLoaderConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.CSS_EXTRACT_PLUGIN, context,
                          new CssExtractPluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.PROVIDE_PLUGIN, context,
                          new ProvidePluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.COPY_PLUGIN, context, new CopyPluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.CLEAN_OUTPUT_DIR_PLUGIN, context,
                          new CleanOutputDirPluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.MIN_CHUNK_SIZE_PLUGIN, context,
                          new MinChunkSizePluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.FILTER_WARNINGS_PLUGIN, context,
                          new FilterWarningsPluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.DEV_ONLY, context, new DevOnlyConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.PROD_ONLY, context, new ProdOnlyConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.BUNDLE_ANALYZER_PLUGIN, context,
                          new BundleAnalyzerPluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.HTML_PLUGIN, context, new HtmlPluginConfigurator()))
                      .then(context => this.configuratorWrapper(Ids.BUILT_IN_PLUGIN, context,
                          new BuiltInPluginConfigurator()))
            
            // Allow filtering
                      .then(context => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.APPLY_EXTENSION_WEBPACK_CONFIG, {
                              context
                          }).then(() => context);
                      })
            
            // Add the additional webpack config
                      .then(context => this.mergeAdditionalConfig(context))
            
            // Allow filtering
                      .then(context => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_WEBPACK_CONFIG, {
                              context
                          }).then(() => {
                    
                              // Check if we are running in docker and having to watch for changes -> Enable polling
                              if (context.webpackConfig.watch && isDocker()) {
                                  if (isUndefined(context.webpackConfig.watchOptions)) {
                                      context.webpackConfig.watchOptions = {};
                                  }
                                  context.webpackConfig.watchOptions.poll = 600;
                              }
                    
                              // Done
                              return context;
                          });
                      });
    }
    
    /**
     * Internal helper that wraps a single configurator and allows the disabling of specific configuration
     * steps
     * @param identifier
     * @param context
     * @param configurator
     */
    protected configuratorWrapper(
        identifier: string,
        context: WorkerContext,
        configurator: ConfiguratorInterface
    ): Promise<WorkerContext>
    {
        return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_CONFIGURATOR, {
            identifier,
            configurator,
            useConfigurator: true,
            context
        }).then(args => {
            // Skip the configurator
            if (args.useConfigurator !== true) {
                return Promise.resolve(context);
            }
            
            // Run through configuration lifecycle
            return context.eventEmitter.emitHook(AssetBuilderEventList.BEFORE_CONFIGURATOR, {
                              identifier,
                              configurator: args.configurator,
                              context
                          })
                          .then(args => args.configurator.apply(identifier, args.context)).then(res => {
                    if (isEmpty(res)) {
                        console.log(configurator);
                        process.exit();
                    }
                    return res;
                })
                          .then(context => context.eventEmitter.emitHook(AssetBuilderEventList.AFTER_CONFIGURATOR, {
                              identifier,
                              context
                          }))
                          .then(args => args.context);
        });
    }
    
    /**
     * Internal helper to load the additional webpack config file which may have been added
     * to the app definition
     * @param context
     */
    protected mergeAdditionalConfig(context: WorkerContext): Promise<WorkerContext>
    {
        // Ignore if there is no webpack config
        if (isUndefined(context.app.webpackConfig)) {
            return Promise.resolve(context);
        }
        
        // Check if we got an object
        if (isPlainObject(context.app.webpackConfig)) {
            context.webpackConfig = merge(context.webpackConfig, context.app.webpackConfig as any);
            return Promise.resolve(context);
        }
        
        // Check if we got true -> webpack.config.js in the source directory
        if (context.app.webpackConfig === true) {
            context.app.webpackConfig = './webpack.config.js';
        }
        
        // Check if we got a reference
        if (isString(context.app.webpackConfig)) {
            const customWebpackConfigPath = path.resolve(context.parentContext.sourcePath,
                (context.app.webpackConfig as string));
            try {
                const customWebpackConfig = require(customWebpackConfigPath);
                if (isPlainObject(customWebpackConfig)) {
                    context.webpackConfig = merge(context.webpackConfig, customWebpackConfig);
                    return Promise.resolve(context!);
                } else if (isFunction(customWebpackConfig)) {
                    context.eventEmitter.unbindAll(
                        AssetBuilderEventList.CUSTOM_WEBPACK_CONFIG_LOADING);
                    context.eventEmitter.bind(
                        AssetBuilderEventList.CUSTOM_WEBPACK_CONFIG_LOADING, () => customWebpackConfig(context));
                    return context.eventEmitter.emitHook(AssetBuilderEventList.CUSTOM_WEBPACK_CONFIG_LOADING, {})
                                  .then(() => context) as Promise<WorkerContext>;
                }
                return Promise.reject(new Error('The default export of ' + customWebpackConfigPath +
                                                ' has to be an object or a function!')) as Promise<WorkerContext>;
            } catch (e) {
                return Promise.reject(
                    new Error('Could not resolve the custom webpack config at: "' + customWebpackConfigPath + '"'));
            }
        }
        
        return Promise.reject(context);
    }
}