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
 * Last modified: 2019.10.05 at 21:39
 */

import path from 'path';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {ConfiguratorIdentifier, LoaderIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import {AbstractStyleLoaderConfigurator} from './AbstractStyleLoaderConfigurator';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class LessConfigurator extends AbstractStyleLoaderConfigurator implements ConfiguratorInterface
{
    public async apply(context: WorkerContext): Promise<void>
    {
        await ConfigGenUtil.addLoader(LoaderIdentifier.LESS, context, /\.less$/, {
            use: [
                await this.makeLastLoader(context),
                {
                    loader: 'css-loader'
                },
                await this.makePostcssConfig(ConfiguratorIdentifier.LESS, context),
                {
                    loader: 'less-loader'
                },
                {
                    loader: path.resolve(context.parentContext.paths.assetBuilder,
                        './Webpack/Loaders/ResourceLoader/ResourceLoader.js'),
                    options: {
                        currentDir: context.parentContext.paths.source,
                        entry: context.app.entry,
                        ext: ['less', 'css']
                    }
                }
            ]
        });
    }
}