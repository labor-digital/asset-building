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
 * Last modified: 2021.03.25 at 23:58
 */

import type {PlainObject} from '@labor-digital/helferlein';
import {AssetBuilderEventList} from '../../AssetBuilderEventList';
import type {WorkerContext} from '../../Core/WorkerContext';
import type {LoaderIdentifier, PluginIdentifier} from '../../Identifier';

export interface IPluginProvider<T = any>
{
    (config: T): any
}

export class ConfigGenUtil
{
    
    /**
     * Helper to add a new webpack loader configuration to the webpack config object of the provided context
     *
     * @param identifier The unique identifier of the loader to register
     * @param context The context to add the plugin to
     * @param test The "test" for the loader. A regex for the matching filenames
     * @param config The loader configuration to apply
     */
    public static async addLoader<ConfT = PlainObject>(
        identifier: LoaderIdentifier | string,
        context: WorkerContext,
        test: RegExp,
        config: ConfT
    ): Promise<boolean>
    {
        
        let args = await context.eventEmitter.emitHook(AssetBuilderEventList.CHECK_IDENTIFIER_STATE, {
            identifier, enabled: true, config, context
        });
        
        if (!args.enabled) {
            return false;
        }
        
        args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
            test, identifier, context
        });
        
        args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
            config: {
                ...config,
                test: args.test
            },
            identifier,
            context
        });
        
        context.webpackConfig.module.rules.push(args.config);
        
        return true;
    }
    
    /**
     * Does exactly the same as addLoader() but triggers the "FILTER_JS_EXCLUDE_PATTERN" hook first
     * and then adds the result to the "config" object, before the other loader hooks are executed
     *
     * @param identifier
     * @param context
     * @param test
     * @param config
     */
    public static async addJsLoader<ConfT = PlainObject>(
        identifier: LoaderIdentifier | string,
        context: WorkerContext,
        test: RegExp,
        config: ConfT
    ): Promise<boolean>
    {
        const args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_JS_EXCLUDE_PATTERN, {
            pattern: /node_modules/,
            context
        });
        
        return this.addLoader(identifier, context, test, {
            exclude: args.pattern ?? undefined,
            ...config
        });
    }
    
    /**
     * Allows extensions to filter a given plugin configuration
     * @param identifier The unique identifier of the plugin to register
     * @param context The context to add the plugin to
     * @param config The configuration to pass to the plugin
     */
    public static async emitPluginFilter<ConfT = PlainObject>(
        identifier: PluginIdentifier | string,
        context: WorkerContext,
        config: ConfT
    ): Promise<ConfT>
    {
        const args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
            config, identifier, context
        });
        return args.config;
    }
    
    /**
     * Helper to add a new plugin to the webpack configuration object of the provided context
     *
     * @param identifier The unique identifier of the plugin to register
     * @param context The context to add the plugin to
     * @param config The configuration to pass to the plugin
     * @param provider A callback that receives the config and should return the plugin instance/reference to register
     *
     * Returns true if the plugin was added, false if it was disabled
     */
    public static async addPlugin<ConfT = PlainObject>(
        identifier: PluginIdentifier | string,
        context: WorkerContext,
        config: ConfT,
        provider: IPluginProvider<ConfT>
    ): Promise<boolean>
    {
        let args = await context.eventEmitter.emitHook(AssetBuilderEventList.CHECK_IDENTIFIER_STATE, {
            identifier, enabled: true, config, context
        });
        
        if (!args.enabled) {
            return false;
        }
        
        context.webpackConfig.plugins.push(provider(
            await this.emitPluginFilter(identifier, context, config)
        ));
        
        return true;
    }
}