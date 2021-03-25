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
 * Last modified: 2019.10.05 at 20:50
 */

import {AssetBuilderEventList} from '../../../AssetBuilderEventList';
import type {WorkerContext} from '../../../Core/WorkerContext';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class JsPreloadConfigurator implements ConfiguratorInterface
{
    public apply(identifier: string, context: WorkerContext): Promise<WorkerContext>
    {
        
        // Storage for temporary values
        let excludePattern: RegExp | undefined = undefined;
        let loaders: Array<any> = [];
        
        // Loop through the preloader configuration
        return Promise.resolve(context)
            
            // Allow filtering of the loaders
                      .then(() => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_JS_PRE_LOADERS, {
                              loaders,
                              identifier,
                              context
                          });
                      })
                      .then(args => {
                          loaders = args.loaders;
                          return context;
                      })
            
            // Prepare exclude pattern
                      .then(() => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_JS_EXCLUDE_PATTERN, {
                              pattern: /node_modules/,
                              identifier,
                              context
                          });
                      })
                      .then(args => {
                          excludePattern = args.pattern;
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
                              test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
                              identifier,
                              context
                          });
                      })
                      .then(args => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
                              config: {
                                  test: args.test,
                                  exclude: excludePattern ?? undefined,
                                  enforce: 'pre',
                                  use: loaders
                              },
                              identifier,
                              context
                          });
                      })
                      .then(args => {
                          if (args.config.use.length !== 0) {
                              context.webpackConfig.module.rules.push(args.config);
                          }
                          return context;
                      });
        
    }
}