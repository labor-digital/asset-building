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
// @ts-ignore
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {EventList} from '../../../EventList';
import {ConfiguratorIdentifier, LoaderIdentifier} from '../../../Identifier';

export abstract class AbstractStyleLoaderConfigurator
{
    /**
     * Defines the post css configuration for sass and less loaders
     */
    protected async makePostcssConfig(identifier: ConfiguratorIdentifier, context: WorkerContext): Promise<PlainObject>
    {
        let resolveReference: any = undefined;
        
        let args = await context.eventEmitter.emitHook(EventList.FILTER_BROWSER_LIST, {
            browserList: '> 1%, last 10 versions',
            parent: identifier,
            isPostcssLoader: true,
            context
        });
        
        args = await context.eventEmitter.emitHook(EventList.FILTER_POSTCSS_PLUGINS, {
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
            parent: identifier,
            context
        });
        
        const plugins: Array<any> = args.plugins;
        
        args = await context.eventEmitter.emitHook(EventList.FILTER_LOADER_CONFIG, {
            config: {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: (loader: any) => {
                        resolveReference = loader.resolve;
                        return {
                            plugins: plugins
                        };
                    }
                }
            },
            identifier: LoaderIdentifier.POST_CSS,
            parent: identifier,
            isPostcssLoader: true,
            context
        });
        
        return args.config;
    }
    
    /**
     * Generates the last loader that should be executed in a style loader chain.
     * By default this is the loader of mini-css-extract-plugin, or "style-loader" when dev-server is enabled.
     *
     * @param context
     * @param identifier
     * @protected
     */
    protected async makeLastLoader(context: WorkerContext, identifier: LoaderIdentifier): Promise<any>
    {
        let lastLoader: any =
            {
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: '../'
                }
            };
        
        if (context.parentContext.options.devServer) {
            lastLoader = 'style-loader';
        }
        
        const args = await context.eventEmitter.emitHook(EventList.FILTER_LAST_STYLE_LOADER, {
            identifier,
            context,
            loader: lastLoader
        });
        
        return args.loader;
    }
}