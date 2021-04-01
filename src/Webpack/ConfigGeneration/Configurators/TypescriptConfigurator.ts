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

import {isString} from '@labor-digital/helferlein';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as fs from 'fs';
import path from 'path';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {LoaderIdentifier, PluginIdentifier, RuleIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class TypescriptConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        const configFilePath = this.resolveTsConfigPath(context);
        
        if (!fs.existsSync(configFilePath)) {
            throw new Error(
                'The configured tsconfig.json path is invalid, because the file does not exist: "' +
                configFilePath + '"!');
        }
        
        await ConfigGenUtil.addJsRule(RuleIdentifier.TS, context, /\.js$|\.jsx$|\.ts$|\.tsx$/, {
            use: await ConfigGenUtil
                .makeRuleUseChain(RuleIdentifier.TS, context)
                .addLoader(LoaderIdentifier.TS, {
                    loader: 'ts-loader',
                    options: {
                        context: path.dirname(configFilePath),
                        configFile: configFilePath,
                        transpileOnly: true,
                        experimentalWatchApi: true,
                        onlyCompileBundledFiles: true,
                        appendTsSuffixTo: [/\.vue$/]
                    }
                })
                .finish()
        });
        
        // Only register the type-checker plugin if it was actually required by the app
        if (context.app.useTypeChecker) {
            await ConfigGenUtil.addPlugin(PluginIdentifier.TS_CHECK, context, {
                    typescript: {
                        context: path.dirname(configFilePath),
                        configFile: configFilePath
                    }
                },
                config => new ForkTsCheckerWebpackPlugin(config));
        }
    }
    
    /**
     * Helper to resolve the ts config path based on the current app configuration
     * @param context
     * @protected
     */
    protected resolveTsConfigPath(context: WorkerContext): string
    {
        let tsConfig = context.app.tsConfig;
        
        if (!tsConfig) {
            return path.resolve(context.parentContext.paths.assetBuilder, '../static/ts/tsconfig.json');
        }
        
        if (tsConfig === true) {
            tsConfig = './tsconfig.json';
        }
        
        if (isString(tsConfig)) {
            if (path.isAbsolute(tsConfig)) {
                return tsConfig;
            }
            
            return path.resolve(context.parentContext.paths.source, tsConfig);
        }
        
        throw new Error('Could not resolve the tsconfig.json path based on your configuration');
    }
}