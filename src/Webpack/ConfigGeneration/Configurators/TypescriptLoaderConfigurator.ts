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
 * Last modified: 2019.10.05 at 21:15
 */

import type {PlainObject} from '@labor-digital/helferlein';
import path from 'path';
import {AssetBuilderEventList} from '../../../AssetBuilderEventList';
import type {WorkerContext} from '../../../Core/WorkerContext';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class TypescriptLoaderConfigurator implements ConfiguratorInterface
{
    public async apply(identifier: string, context: WorkerContext): Promise<WorkerContext>
    {
        let args;
        args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_TYPESCRIPT_OPTIONS, {
            options: {
                context: context.parentContext.sourcePath,
                configFile: path.resolve(context.parentContext.assetBuilderPath, '../ts/tsconfig.json'),
                transpileOnly: !(context.app.useTypeChecker === true),
                experimentalWatchApi: true,
                onlyCompileBundledFiles: true,
                appendTsSuffixTo: [/\.vue$/]
            },
            context
        });
        
        const typescriptOptions: PlainObject = args.options;
        
        args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_JS_EXCLUDE_PATTERN, {
            pattern: /node_modules/,
            identifier,
            context
        });
        
        const excludePattern: RegExp = args.pattern;
        
        args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_TEST, {
            test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
            identifier,
            context
        });
        
        args = await context.eventEmitter.emitHook(AssetBuilderEventList.FILTER_LOADER_CONFIG, {
            config: {
                test: args.test,
                exclude: excludePattern === null ? undefined : excludePattern,
                use: [
                    {
                        loader: 'ts-loader',
                        options: typescriptOptions
                    }
                ]
            },
            identifier,
            context
        });
        
        context.webpackConfig.module.rules.push(args.config);
        
        return context;
        
    }
}