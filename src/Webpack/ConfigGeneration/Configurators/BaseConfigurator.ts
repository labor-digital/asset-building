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
 * Last modified: 2019.10.05 at 20:06
 */

import {asArray, inflectToUnderscore, md5} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../../Core/WorkerContext';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export const resolveFileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

export class BaseConfigurator implements ConfiguratorInterface
{
    public apply(context: WorkerContext): Promise<void>
    {
        // Build the json-p function name
        const jsonPName = 'labor_webpack_' + md5(
                          context.parentContext.paths.source +
                          (context.isProd ? Math.random() : '') +
                          context.appId +
                          JSON.stringify(context.app)) + '_' + inflectToUnderscore(context.app.appName!);
        
        // Populate the basic webpack configuration
        context.webpackConfig = {
            name: context.app.appName + '',
            mode: context.isProd ? 'production' : 'development',
            target: ['web', 'es5'],
            watch: context.parentContext.options.watch ?? false,
            devtool: context.isProd ? 'source-map' : 'eval',
            entry: {},
            plugins: [],
            module: {
                rules: []
            },
            performance: {
                hints: false
            },
            resolve: {
                modules: asArray(context.parentContext.paths.additionalResolverPaths),
                extensions: resolveFileExtensions
            },
            resolveLoader: {
                modules: asArray(context.parentContext.paths.additionalResolverPaths)
            },
            output: {
                chunkLoadingGlobal: jsonPName
            }
        };
        
        // Done
        return Promise.resolve();
    }
}