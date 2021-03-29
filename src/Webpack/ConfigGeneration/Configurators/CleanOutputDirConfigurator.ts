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
import type {WorkerContext} from '../../../Core/WorkerContext';
import {PluginIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class CleanOutputDirConfigurator implements ConfiguratorInterface
{
    public async apply(context: WorkerContext): Promise<void>
    {
        if (!context.isProd && !context.parentContext.options.devServer || context.app.keepOutputDirectory) {
            return;
        }
        
        const inputDirectory = path.dirname(context.app.entry);
        const outputDirectory = context.webpackConfig.output.path;
        
        // Add plugin to clean the output directory when the app is compiled
        // But make sure to keep all sources which have been defined in there
        const sourceToExclude = path.relative(outputDirectory, inputDirectory)
                                    .split(/\\\//)!.shift()!.replace(/^[.\\\/]+/g, '');
        const cleanOnceBeforeBuildPatterns = ['**/*'];
        if (sourceToExclude.length > 0) {
            cleanOnceBeforeBuildPatterns.push('!' + sourceToExclude);
            cleanOnceBeforeBuildPatterns.push('!' + sourceToExclude + '/**/*');
        }
        
        await ConfigGenUtil.addPlugin(PluginIdentifier.CLEAN_OUTPUT_DIR, context, {
            verbose: context.parentContext.options.verbose,
            cleanStaleWebpackAssets: false,
            cleanOnceBeforeBuildPatterns: cleanOnceBeforeBuildPatterns
        }, config => new CleanWebpackPlugin(config));
    }
}