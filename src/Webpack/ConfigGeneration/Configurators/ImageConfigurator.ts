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

import {md5} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {LoaderIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class ImageConfigurator implements ConfiguratorInterface
{
    public async apply(context: WorkerContext): Promise<void>
    {
        
        // Prepare image optimization configuration
        const imageOptimization = {
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
                    quality: [context.app.imageCompressionQuality! / 100, context.app.imageCompressionQuality! / 100],
                    speed: 2,
                    strip: true
                }
            }
        };
        
        // Name generation which uses a weak hash in development
        const generateName = (file: string) => {
            if (context.isProd) {
                return '[name]-[fullhash].[ext]';
            }
            // Use a weak hash -> https://www.bountysource.com/issues/30111085-process-out-of-memory-webpack
            return '[name]-' + md5(file) + '.[ext]';
        };
        
        // Generic images
        await ConfigGenUtil.addLoader(LoaderIdentifier.IMAGE, context, /\.(png|jpe?g|gif|webp|avif)$/,
            {
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: generateName,
                            outputPath: 'assets/',
                            limit: context.isProd ? 10000 : 1,
                            fallback: {
                                loader: 'file-loader',
                                options: {
                                    name: generateName,
                                    outputPath: 'assets/'
                                }
                            }
                        }
                    },
                    imageOptimization
                ]
            });
        
        // SVG images -> Fallback for IE 11
        await ConfigGenUtil.addLoader(LoaderIdentifier.IMAGE_SVG, context, /\.svg$/, {
            use: [
                {
                    loader: 'svg-url-loader',
                    options: {
                        name: generateName,
                        outputPath: 'assets/',
                        encoding: context.isProd ? 'base64' : 'none',
                        limit: context.isProd ? 10000 : 1,
                        iesafe: true,
                        stripdeclarations: true
                    }
                },
                imageOptimization
            ]
        });
    }
    
}