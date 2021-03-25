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
 * Last modified: 2020.10.21 at 21:39
 */

import type {EventEmitterEventListener, PlainObject} from '@labor-digital/helferlein';
import type {Configuration, RuleSetRule} from 'webpack';
import type {AssetBuilderConfiguratorIdentifiers as Ids} from '../../AssetBuilderConfiguratorIdentifiers';
import type {AssetBuilderPluginIdentifiers as PluginIds} from '../../AssetBuilderPluginIdentifiers';

export interface ModuleRuleFilter
{
    (test: string, rule: RuleSetRule, baseConfig: Configuration, buildConfig: Configuration): boolean
}

export interface PluginFilter
{
    (constructor: string, plugin: any, index: number, baseConfig: Configuration, buildConfig: Configuration): boolean;
}

export interface ConfigMerger
{
    (baseConfig: Configuration, buildConfig: Configuration): Configuration;
}

export interface MakeEnhancedConfigActionOptions
{
    /**
     * Allows you to manually merge the given and the built configuration into a new
     * configuration object which MUST be returned
     */
    configMerger?: ConfigMerger
    
    /**
     * Allows you to filter the module.rule definitions for the loader registration.
     * The method must return true if the rule/loader should be moved from the given config into the new config,
     * or false if not.
     */
    ruleFilter?: ModuleRuleFilter
    
    /**
     * Allows you to filter the plugins of the given configuration before they are merged into the built config.
     * The method must return true if the plugin should be moved, false if not
     */
    pluginFilter?: PluginFilter
    
    /**
     * A list of asset builder configurator ids that should be disabled when the configuration is being build
     */
    disableConfigurators?: Array<Ids>
    
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