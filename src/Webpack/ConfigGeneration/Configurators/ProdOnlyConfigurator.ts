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

import {merge} from 'webpack-merge';
import {Dependencies} from '../../../Core/Dependencies';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {PluginIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class ProdOnlyConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        if (!context.isProd) {
            return Promise.resolve();
        }
        
        context.webpackConfig = merge(context.webpackConfig, {
            optimization: {
                minimize: true,
                minimizer: [
                    new Dependencies.terserPlugin(
                        await ConfigGenUtil.emitPluginFilter(PluginIdentifier.JS_UGLIFY, context, {
                            parallel: true,
                            extractComments: true,
                            terserOptions: {
                                mangle: true,
                                toplevel: true,
                                compress: {
                                    typeofs: false
                                }
                            }
                        })
                    ),
                    new Dependencies.cssMinimizerPlugin(
                        await ConfigGenUtil.emitPluginFilter(PluginIdentifier.CSS_UGLIFY, context, {}))
                ]
            }
        });
        
    }
}