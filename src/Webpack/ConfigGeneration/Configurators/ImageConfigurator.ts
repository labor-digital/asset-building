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
 * Last modified: 2019.10.05 at 20:34
 */

import type {WorkerContext} from '../../../Core/WorkerContext';
import {LoaderIdentifier, RuleIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class ImageConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        await ConfigGenUtil.addRule(RuleIdentifier.IMAGE, context, /\.(png|jpe?g|gif|webp|avif)$/,
            {
                use: await ConfigGenUtil
                    .makeRuleUseChain(RuleIdentifier.IMAGE, context)
                    .addLoader(LoaderIdentifier.IMAGE_OPTIMIZATION, {
                        loader: 'image-webpack-loader',
                        options: {
                            disable: !context.isProd || context.app.imageCompression === false,
                            mozjpeg: {
                                progressive: true,
                                quality: context.app.imageCompressionQuality,
                                dcScanOpt: 2,
                                dct: 'float'
                            },
                            optipng: {
                                optimizationLevel: 5
                            },
                            pngquant: {
                                quality: [
                                    context.app.imageCompressionQuality! / 100,
                                    context.app.imageCompressionQuality! / 100
                                ],
                                speed: 2,
                                strip: true
                            }
                        }
                    })
                    .finish(),
                type: 'asset',
                generator: {
                    filename: 'assets/[name]-[hash][ext][query]'
                },
                parser: {
                    dataUrlCondition: {
                        maxSize: context.isProd ? 10000 : 1
                    }
                }
            });
    }
    
}