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
import {cloneList, forEach} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import {GeneralHelper} from '../../Helpers/GeneralHelper';
import type {PluginIdentifier, RuleIdentifier} from '../../Identifier';
import type {IPluginProvider, IRuleUseChainCollector} from './types';


export class ConfigGenUtil
{
    
    /**
     * Helper to add a new webpack rule configuration to the webpack config object of the provided context
     *
     * @param identifier The unique identifier of the loader to register
     * @param context The context to add the plugin to
     * @param test The "test" for the loader. A regex for the matching filenames
     * @param config The loader configuration to apply
     * @param prepend If true, the rule will be added before all other rules
     */
    public static async addRule<ConfT = PlainObject>(
        identifier: RuleIdentifier | string,
        context: WorkerContext,
        test: RegExp,
        config: ConfT,
        prepend?: boolean
    ): Promise<boolean>
    {
        
        let args = await context.eventEmitter.emitHook(EventList.CHECK_IDENTIFIER_STATE, {
            identifier, enabled: true, config, context
        });
        
        if (!args.enabled) {
            return false;
        }
        
        args = await context.eventEmitter.emitHook(EventList.FILTER_RULE_TEST, {
            test, identifier, context
        });
        
        args = await context.eventEmitter.emitHook(EventList.FILTER_RULE_CONFIG, {
            config: {
                ...cloneList(config),
                test: args.test
            },
            identifier,
            context
        });
        
        const rules = context.webpackConfig.module.rules;
        if (prepend) {
            rules.unshift(args.config);
        } else {
            rules.push(args.config);
        }
        
        return true;
    }
    
    /**
     * Internal helper to build a rule "use" list where each of the added elements gets filtered by the outside world
     */
    public static makeRuleUseChain(
        ruleIdent: RuleIdentifier | string,
        context: WorkerContext
    ): IRuleUseChainCollector
    {
        const def: Array<{ type: 'raw' | 'given', config: PlainObject, identifier?: string }> = [];
        
        return {
            addLoader(identifier, config)
            {
                def.push({type: 'given', config: cloneList(config), identifier});
                return this;
            },
            
            addRaw(list: Array<any>)
            {
                forEach(list, config => {
                    def.push({type: 'raw', config: cloneList(config)});
                });
                
                return this;
            },
            
            async finish(): Promise<Array<any>>
            {
                let use: Array<PlainObject> = [];
                
                await GeneralHelper.awaitingForEach(def, async (entry) => {
                    if (entry.type === 'raw') {
                        use.push(entry.config);
                        return;
                    }
                    
                    let args = await context.eventEmitter.emitHook(EventList.CHECK_IDENTIFIER_STATE, {
                        identifier: entry.identifier,
                        ruleIdent,
                        enabled: true,
                        config: entry.config,
                        context
                    });
                    
                    if (!args.enabled) {
                        return this;
                    }
                    
                    args = await context.eventEmitter.emitHook(EventList.FILTER_LOADER_CONFIG, {
                        identifier: entry.identifier,
                        ruleIdent,
                        config: entry.config,
                        context
                    });
                    
                    use.push(args.config);
                    
                    args = await context.eventEmitter.emitHook(EventList.AFTER_LOADER_CONFIG_ADDED, {
                        identifier: entry.identifier,
                        ruleIdent,
                        config: entry.config,
                        use,
                        context
                    });
                    use = args.use;
                });
                
                let args = await context.eventEmitter.emitHook(EventList.FILTER_RULE_USE_LIST, {
                    ruleIdent, use, context
                });
                
                return args.use;
            }
        };
        
    }
    
    /**
     * Does exactly the same as addRule() but triggers the "FILTER_JS_EXCLUDE_PATTERN" hook first
     * and then adds the result to the "config" object, before the other loader hooks are executed
     *
     * @param identifier
     * @param context
     * @param test
     * @param config
     */
    public static async addJsRule<ConfT = PlainObject>(
        identifier: RuleIdentifier | string,
        context: WorkerContext,
        test: RegExp,
        config: ConfT
    ): Promise<boolean>
    {
        const args = await context.eventEmitter.emitHook(EventList.FILTER_JS_EXCLUDE_PATTERN, {
            pattern: /node_modules/,
            context
        });
        
        return this.addRule(identifier, context, test, {
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
        const args = await context.eventEmitter.emitHook(EventList.FILTER_PLUGIN_CONFIG, {
            config: cloneList(config), identifier, context
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
        let args = await context.eventEmitter.emitHook(EventList.CHECK_IDENTIFIER_STATE, {
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