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

import {isString} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {LoaderIdentifier, RuleIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class ImageConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        const maxInlineSize = 10000;
        
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
                    quality: [
                        context.app.imageCompressionQuality! / 100,
                        context.app.imageCompressionQuality! / 100
                    ],
                    speed: 2,
                    strip: true
                }
            }
        };
        
        await ConfigGenUtil.addRule(RuleIdentifier.IMAGE, context, /\.(png|jpe?g|gif|webp|avif)$/,
            {
                use: await ConfigGenUtil
                    .makeRuleUseChain(RuleIdentifier.IMAGE, context)
                    .addLoader(LoaderIdentifier.IMAGE_OPTIMIZATION, imageOptimization)
                    .finish(),
                type: 'asset',
                generator: {
                    filename: 'assets/[name]-[hash][ext][query]'
                },
                parser: {
                    dataUrlCondition: {
                        maxSize: context.isProd ? maxInlineSize : undefined
                    }
                }
            });
        
        // SVG images -> Fallback to fix issues with the iconfont-webpack-plugin
        await ConfigGenUtil.addRule(RuleIdentifier.IMAGE_SVG, context, /\.svg$/, {
            use: await ConfigGenUtil
                .makeRuleUseChain(RuleIdentifier.IMAGE_SVG, context)
                .addLoader(LoaderIdentifier.IMAGE_OPTIMIZATION, imageOptimization)
                .finish(),
            type: 'asset',
            generator: {
                filename: 'assets/[name]-[hash][ext][query]',
                dataUrl(source: any)
                {
                    source = isString(source) ? source : source.toString();
                    
                    // This is a fix for the iconfont-webpack-plugin so we don't add module.exports to the data url
                    if (source.startsWith('module.exports="\\"data:')) {
                        return source.substr(18, source.length - 4 - 18);
                    }
                    
                    return require('mini-svg-data-uri')(source);
                }
            },
            parser: {
                dataUrlCondition: (source: any) => {
                    if (!context.isProd) {
                        return true;
                    }
                    
                    source = isString(source) ? source : source.toString();
                    
                    // This is a fix for the iconfont-webpack-plugin,
                    // so everything that starts with module.exports is automatically written as data url
                    if (source.startsWith('module.exports=') || source.startsWith('data:')) {
                        return true;
                    }
                    
                    return (new Blob([source]).size) < maxInlineSize;
                }
            }
        });
    }
    
}