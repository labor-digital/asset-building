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
 * Last modified: 2019.10.05 at 20:41
 */

import {md5} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {LoaderIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class FontConfigurator implements ConfiguratorInterface
{
    public async apply(context: WorkerContext): Promise<void>
    {
        await ConfigGenUtil.addLoader(LoaderIdentifier.FONT, context, /\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/, {
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: (file: string) => {
                            if (context.isProd) {
                                return '[name]-[fullhash].[ext]';
                            }
                            // Use a weak hash -> https://www.bountysource.com/issues/30111085-process-out-of-memory-webpack
                            return '[name]-' + md5(file) + '.[ext]';
                        },
                        outputPath: 'assets/'
                    }
                }
            ]
        });
    }
}