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
 * Last modified: 2019.10.06 at 15:44
 */

import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import path from 'path';
import {AssetBuilderEventList} from '../../../AssetBuilderEventList';
import type {WorkerContext} from '../../../Core/WorkerContext';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class CleanOutputDirPluginConfigurator implements ConfiguratorInterface
{
    public apply(identifier: string, context: WorkerContext): Promise<WorkerContext>
    {
        if (!context.isProd) {
            return Promise.resolve(context);
        }
        if (context.app.keepOutputDirectory) {
            return Promise.resolve(context);
        }
        
        const inputDirectory = path.dirname(context.app.entry);
        const outputDirectory = context.webpackConfig.output.path;
        
        // Add plugin to clean the output directory when the app is compiled
        // But make sure to keep all sources which have been defined in there
        const sourceToExclude = path.relative(outputDirectory, inputDirectory)
                                    .split(/\\\//)!
            .shift()!
            .replace(/^[.\\\/]+/g, '');
        const cleanOnceBeforeBuildPatterns = ['**/*'];
        if (sourceToExclude.length > 0) {
            cleanOnceBeforeBuildPatterns.push('!' + sourceToExclude);
            cleanOnceBeforeBuildPatterns.push('!' + sourceToExclude + '/**/*');
        }
        
        // Allow filtering
        return context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_PLUGIN_CONFIG, {
                          config: {
                              verbose: true,
                              cleanStaleWebpackAssets: false,
                              cleanOnceBeforeBuildPatterns: cleanOnceBeforeBuildPatterns
                          },
                          identifier,
                          context
                      })
                      .then(args => {
                          context.webpackConfig.plugins.push(new CleanWebpackPlugin(args.config));
                          return context;
                      });
    }
}