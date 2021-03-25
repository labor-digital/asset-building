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
 * Last modified: 2019.10.06 at 16:37
 */

import {isNull} from '@labor-digital/helferlein';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import {AssetBuilderEventList} from '../../../AssetBuilderEventList';
import type {WorkerContext} from '../../../Core/WorkerContext';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class HtmlPluginConfigurator implements ConfiguratorInterface
{
    public apply(identifier: string, context: WorkerContext): Promise<WorkerContext>
    {
        if (isNull(context.app.htmlTemplate)) {
            return Promise.resolve(context);
        }
        
        // Apply a basic configuration
        let template = context.app.htmlTemplate;
        if (template === true) {
            template = {};
        }
        if (typeof template!.template === 'undefined') {
            template!.template = path.resolve(
                path.join(__dirname, '../../../../static/HtmlDefaultTemplate.ejs')
            );
            if (typeof template!.inject === 'undefined') {
                template!.inject = false;
            }
            if (!Array.isArray(template!.meta)) {
                template!.meta = [
                    {
                        'http-equiv': 'X-UA-Compatible',
                        content: 'IE=edge,chrome=1'
                    }, {
                        name: 'viewport',
                        content: 'width=device-width, initial-scale=1.0, user-scalable=0'
                    }
                ];
            }
        }
        if (typeof template!.appMountId === 'undefined') {
            template!.appMountId = 'app';
        }
        
        // Allow filtering
        return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_HTML_PLUGIN_TEMPLATE, {
                          template,
                          identifier,
                          context
                      })
                      .then(args => {
                          return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
                              config: args.template,
                              identifier,
                              context
                          });
                      })
                      .then(args => {
                          context.webpackConfig.plugins.push(new HtmlWebpackPlugin(args.config));
                          return context;
                      });
    }
    
}