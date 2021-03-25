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
 * Last modified: 2019.10.05 at 21:44
 */

import type {PlainObject} from '@labor-digital/helferlein';
import {AssetBuilderConfiguratorIdentifiers} from '../../../AssetBuilderConfiguratorIdentifiers';
import {AssetBuilderEventList} from '../../../AssetBuilderEventList';
import type {WorkerContext} from '../../../Core/WorkerContext';

export abstract class AbstractStyleLoaderConfigurator
{
    /**
     * Defines the post css configuration for sass and less loaders
     */
    protected makePostcssConfig(identifier: string, context: WorkerContext): Promise<PlainObject>
    {
        let resolveReference: any = undefined;
        return Promise.resolve()
                      .then(() => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_BROWSER_LIST, {
                              browserList: '> 1%, last 10 versions',
                              identifier: AssetBuilderConfiguratorIdentifiers.POST_CSS_LOADER,
                              parent: identifier,
                              isPostcssLoader: true,
                              context
                          });
                      })
                      .then((args) => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_POSTCSS_PLUGINS, {
                              plugins: [
                                  require('autoprefixer')({
                                      overrideBrowserslist: args.browserList
                                  }),
                                  require('iconfont-webpack-plugin')({
                                      resolve: function () {
                                          return resolveReference(...arguments);
                                      },
                                      modules: false
                                  })
                              ],
                              identifier: AssetBuilderConfiguratorIdentifiers.POST_CSS_LOADER,
                              parent: identifier,
                              context
                          });
                      })
                      .then(args => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
                              config: {
                                  loader: 'postcss-loader',
                                  options: {
                                      postcssOptions: {
                                          plugins: args.plugins
                                      }
                                  }
                              },
                              identifier: AssetBuilderConfiguratorIdentifiers.POST_CSS_LOADER,
                              parent: identifier,
                              isPostcssLoader: true,
                              context
                          });
                      })
                      .then(args => args.config);
    }
}