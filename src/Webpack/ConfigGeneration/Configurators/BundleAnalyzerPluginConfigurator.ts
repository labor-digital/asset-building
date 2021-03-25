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
 * Last modified: 2019.10.06 at 16:18
 */

// @ts-ignore
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer';
import {merge} from 'webpack-merge';
import {AssetBuilderEventList} from '../../../AssetBuilderEventList';
import type {WorkerContext} from '../../../Core/WorkerContext';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class BundleAnalyzerPluginConfigurator implements ConfiguratorInterface
{
    public apply(identifier: string, context: WorkerContext): Promise<WorkerContext>
    {
        if (context.mode !== 'analyze') {
            return Promise.resolve(context);
        }
        return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
            config: {},
            identifier,
            context
        }).then(args => {
            context.webpackConfig = merge(context.webpackConfig, {
                profile: true,
                plugins: [
                    new BundleAnalyzerPlugin(args.config)
                ]
            });
            return context;
        });
    }
}