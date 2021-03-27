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
 * Last modified: 2021.03.26 at 15:25
 */

import type {EventEmitterEventListener, PlainObject} from '@labor-digital/helferlein';
import type {Compiler, Configuration, RuleSetRule, Stats} from 'webpack';
import type WebpackDevServer from 'webpack-dev-server';
import type {AssetBuilderPluginIdentifiers as PluginIds} from '../../AssetBuilderPluginIdentifiers';
import type {WorkerContext} from '../../Core/WorkerContext';
import type {Identifier} from '../../Identifier';

export interface ICompilerOptions
{
    /**
     * Allows you to manually supply the configuration to pass to the compiler.
     * If this is omitted a new configuration is build by the config generator
     */
    config?: Configuration;
    
    /**
     * Allows you to supply your own options when the configuration is generated.
     * Note that this option does nothing if "config" was supplied!
     */
    makeConfigOptions?: IMakeConfigActionOptions
    
    /**
     * An optional callback to pass to the compiler
     * NOTE: Be careful with this!
     */
    callback?: ICompilerCallback<Stats>
}

export interface IMakeConfigActionOptions
{
    /**
     * A list of asset builder configurator/plugin ids that should be disabled when the config is generated
     */
    disable?: Array<Identifier>
}

export interface IModuleRuleFilter
{
    (test: string, rule: RuleSetRule, baseConfig: Configuration, buildConfig: Configuration): boolean
}

export interface IPluginFilter
{
    (constructor: string, plugin: any, index: number, baseConfig: Configuration, buildConfig: Configuration): boolean;
}

export interface IConfigMerger
{
    (baseConfig: Configuration, buildConfig: Configuration): Configuration;
}

export interface IMakeEnhancedConfigActionOptions
{
    /**
     * Allows you to manually merge the given and the built configuration into a new
     * configuration object which MUST be returned
     */
    configMerger?: IConfigMerger
    
    /**
     * Allows you to filter the module.rule definitions for the loader registration.
     * The method must return true if the rule/loader should be moved from the given config into the new config,
     * or false if not.
     */
    ruleFilter?: IModuleRuleFilter
    
    /**
     * Allows you to filter the plugins of the given configuration before they are merged into the built config.
     * The method must return true if the plugin should be moved, false if not
     */
    pluginFilter?: IPluginFilter
    
    /**
     * A list of asset builder configurator/plugin ids that should be disabled when the configuration is being build
     */
    disable?: Array<Identifier>
    
    /**
     * A list of asset builder configurator ids that should be disabled when the configuration is being build
     */
    disableConfigurators?: Array<Identifier>
    
    /**
     * A list of all asset builder plugin ids that should be disabled when the configuration is being build
     */
    disablePlugins?: Array<PluginIds>
    
    /**
     * A list of custom event handlers by their event id. This allows you to hook directly into the config generation.
     * All handlers will automatically be unbound after the config was build so you don't have to worry about handler
     * pollution.
     */
    events?: PlainObject<EventEmitterEventListener>
}

export interface IWebpackCompilerCallback
{
    (context: WorkerContext, stats: Stats, resolve: Function, reject: Function): Promise<void>
}

export interface IRunDevServerOptions
{
    compiler?: ICompilerOptions,
    devServer?: WebpackDevServer.Configuration
}

export interface ICompilerResult
{
    /**
     * The context object which was used to start the compiler
     */
    context: WorkerContext;
    
    /**
     * The instance of the webpack compiler that is currently running
     */
    compiler: Compiler
    
    /**
     * The promise that waits until the webpack compiler is finished.
     * It will contain the numeric exit code after it was resolved
     */
    promise: Promise<number>
}

export interface ICompilerCallback<T = Stats>
{
    (err?: Error, result?: T): any;
}