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
 * Last modified: 2020.10.21 at 21:38
 */

import {
    cloneList,
    ComponentProxy,
    forEach,
    getPath,
    isArray,
    isFunction,
    isPlainObject,
    isUndefined
} from '@labor-digital/helferlein';
import type {Configuration} from 'webpack';
// @ts-ignore
import {Options} from 'webpack';
import {AssetBuilderConfiguratorIdentifiers as Ids} from '../../AssetBuilderConfiguratorIdentifiers';
import {AssetBuilderEventList} from '../../AssetBuilderEventList';
import type {WorkerContext} from '../../Core/WorkerContext';
import {resolveFileExtensions} from '../ConfigGeneration/Configurators/BaseConfigurator';
import type {MakeEnhancedConfigActionOptions} from './MakeEnhancedConfigAction.interfaces';
import type {WorkerActionInterface} from './WorkerActionInterface';

export class MakeEnhancedConfigAction implements WorkerActionInterface
{
    
    /**
     * @inheritDoc
     */
    public do(context: WorkerContext, baseConfig?: Configuration, options?: MakeEnhancedConfigActionOptions): any
    {
        baseConfig = baseConfig ?? {};
        options = options ?? {};
        
        context.webpackConfig = cloneList(baseConfig);
        context.webpackConfig.module.rules = [];
        context.webpackConfig.plugins = [];
        
        // Bind all given modifier events to the event emitter, but wrap them in a proxy so we can easily unbind them after we are done
        const proxy = new ComponentProxy(this);
        if (isPlainObject(options.events)) {
            forEach(options.events, (callback, e) => {
                proxy.bind(context.eventEmitter, e, callback);
            });
        }
        
        // Disable the base configuration generation
        proxy.bind(context.eventEmitter, AssetBuilderEventList.FILTER_CONFIGURATOR, (e) => {
            if (e.args.identifier === Ids.BASE) {
                e.args.useConfigurator = false;
            }
        });
        
        return context.do.makeConfiguration({
                          disableConfigurators: options.disableConfigurators,
                          disablePlugins: options.disablePlugins
                      })
                      .then(config => {
                          // Disable performance hints
                          if (isUndefined(config.performance)) {
                              config.performance = {};
                          }
                          if (isPlainObject(config.performance)) {
                              (config.performance as Options.Performance).hints = false;
                          }
            
                          // Merge the resolver paths
                          if (isUndefined(config.resolve)) {
                              config.resolve = {};
                          }
                          if (isUndefined(config.resolveLoader)) {
                              config.resolveLoader = {};
                          }
                          if (!isArray(config.resolve.modules)) {
                              config.resolve.modules = [];
                          }
                          if (!isArray(config.resolveLoader.modules)) {
                              config.resolveLoader.modules = [];
                          }
                          config.resolveLoader.modules.unshift(context.parentContext.buildingNodeModulesPath);
                          forEach(context.parentContext.additionalResolverPaths, (path: string) => {
                              if (config.resolve!.modules!.indexOf(path) === -1) {
                                  config.resolve!.modules!.push(path);
                              }
                              if (config.resolveLoader!.modules!.indexOf(path) === -1) {
                                  config.resolveLoader!.modules!.push(path);
                              }
                          });
                          config.resolve.modules.push(context.parentContext.sourcePath);
            
                          // Merge the resolve extensions
                          if (!isArray(config.resolve.extensions)) {
                              config.resolve.extensions = [];
                          }
                          // Inherit from the base config
                          if (isArray(getPath(baseConfig!, 'resolve.extensions'))) {
                              forEach(baseConfig!.resolve!.extensions!, ext => {
                                  if (config.resolve!.extensions!.indexOf(ext) === -1) {
                                      config.resolve!.extensions!.push(ext);
                                  }
                              });
                          }
                          // Inherit from our own base step
                          forEach(resolveFileExtensions, ext => {
                              if (config.resolve!.extensions!.indexOf(ext) === -1) {
                                  config.resolve!.extensions!.push(ext);
                              }
                          });
            
                          // Register fallback filter -> Don't use any of the already registered patterns
                          if (!isFunction(options!.ruleFilter)) {
                              const knownPatterns: Array<string> = [];
                              forEach(config.module!.rules!, (v: any) => {
                                  if (v.test) {
                                      knownPatterns.push((v.test as RegExp) + '');
                                  }
                              });
                              options!.ruleFilter = function (test) {
                                  return knownPatterns.indexOf(test) !== -1;
                              };
                          }
            
                          // Merge the module rule sets based on the registered filter
                          forEach(baseConfig!.module!.rules!, (rule: any) => {
                              if (options!.ruleFilter!(rule.test + '', rule, baseConfig!, config)) {
                                  config.module!.rules!.push(rule);
                              }
                          });
            
                          // Merge in the plugins of the base confic into the new config
                          forEach(baseConfig!.plugins!, (v, k) => {
                              if (!isFunction(options!.pluginFilter)
                                  || options!.pluginFilter(v.constructor.name + '', v, k, baseConfig!, config)) {
                                  config.plugins!.push(v);
                              }
                          });
            
                          // Allow manual merging
                          if (isFunction(options!.configMerger)) {
                              config = options!.configMerger(baseConfig!, config);
                          }
            
                          // Unbind all handlers
                          proxy.destroy();
            
                          return config;
                      });
    }
    
    
}