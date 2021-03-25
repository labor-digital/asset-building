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
 * Last modified: 2019.10.06 at 16:10
 */

import type {PlainObject} from '@labor-digital/helferlein';
// @ts-ignore
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
// @ts-ignore
import TerserPlugin from 'terser-webpack-plugin';
import {merge} from 'webpack-merge';
import {AssetBuilderConfiguratorIdentifiers} from '../../../AssetBuilderConfiguratorIdentifiers';
import {AssetBuilderEventList} from '../../../AssetBuilderEventList';
import type {WorkerContext} from '../../../Core/WorkerContext';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class ProdOnlyConfigurator implements ConfiguratorInterface
{
    public apply(_: string, context: WorkerContext): Promise<WorkerContext>
    {
        if (!context.isProd) {
            return Promise.resolve(context);
        }
        
        let jsUglifyPluginConfig: PlainObject | null = null;
        let cssUglifyPluginConfig: PlainObject | null = null;
        
        return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
                          config: {
                              parallel: true,
                              extractComments: true,
                              terserOptions: {
                                  mangle: true,
                                  toplevel: true,
                                  compress: {
                                      typeofs: false
                                  }
                              }
                          },
                          identifier: AssetBuilderConfiguratorIdentifiers.JS_UGLIFY_PLUGIN,
                          context
                      })
                      .then(args => {
                          jsUglifyPluginConfig = args.config;
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
                              config: {},
                              identifier: AssetBuilderConfiguratorIdentifiers.CSS_UGLIFY_PLUGIN,
                              context
                          });
                      })
                      .then(args => {
                          cssUglifyPluginConfig = args.config;
                          context.webpackConfig = merge(context.webpackConfig, {
                              optimization: {
                                  minimize: true,
                                  minimizer: [
                                      new TerserPlugin(jsUglifyPluginConfig),
                                      new CssMinimizerPlugin(cssUglifyPluginConfig)
                                  ]
                              }
                          });
                          return context;
                      });
    }
}