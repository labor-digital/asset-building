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
 * Last modified: 2019.10.06 at 15:35
 */

import {forEach, isArray, PlainObject} from '@labor-digital/helferlein';
// @ts-ignore
import CopyWebpackPlugin from 'copy-webpack-plugin';
import fs from 'fs';
import path from 'path';
import type {IAppCopyDefinition} from '../../../Core/types';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {PluginIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {ConfiguratorInterface} from './ConfiguratorInterface';

export class CopyConfigurator implements ConfiguratorInterface
{
    public async apply(context: WorkerContext): Promise<void>
    {
        if (!isArray(context.app.copy)) {
            return;
        }
        
        // Build the list of configurations we should copy for this app
        const isWatch = context.webpackConfig.watch;
        const copyToAdd: Array<IAppCopyDefinition> = [];
        context.app.copy.forEach((config: IAppCopyDefinition) => {
            if (config.inBuildOnly === true && isWatch) {
                return;
            }
            copyToAdd.push(config);
        });
        
        // Ignore if there are no copy configurations for this app
        if (copyToAdd.length === 0) {
            return;
        }
        
        // Fix legacy "ignore" by convertig it to "globOptions"
        copyToAdd.forEach((config: PlainObject) => {
            if (typeof config.ignore === 'undefined') {
                return;
            }
            if (typeof config.globOptions === 'undefined') {
                config.globOptions = {};
            }
            config.globOptions.ignore = config.ignore;
            delete config.ignore;
        });
        
        // Add the context to all configurations
        copyToAdd.forEach(config => {
            
            // Validate input
            if (typeof config.from === 'undefined') {
                throw new Error('Your copy configuration does not define a "from" key!');
            }
            
            // Add context if required
            if (typeof config.context === 'undefined') {
                config.context = context.parentContext.paths.source;
            }
            
            // Check if we have to rewrite the "from" -> Array to string
            if (Array.isArray(config.from)) {
                var thisValue = config.from.shift();
                var jsonConfig = JSON.stringify(config);
                config.from.forEach(v => {
                    var newConfig = JSON.parse(jsonConfig);
                    newConfig.from = v;
                    copyToAdd.push(newConfig);
                });
                config.from = thisValue;
            }
        });
        
        // Make sure we can resolve node modules
        copyToAdd.forEach(config => {
            // Remove all glob related stuff from the path
            let fromDirectory = path.dirname(config.from.replace(/\*.*?$/, ''));
            let fromPrefix = '';
            if (fromDirectory.length > 0 && !fs.existsSync(fromDirectory)) {
                forEach([
                    context.parentContext.paths.nodeModules,
                    context.parentContext.paths.buildingNodeModules,
                    context.parentContext.paths.source
                ], path => {
                    fromPrefix = path;
                    if (fs.existsSync(fromPrefix + fromDirectory)) {
                        return false;
                    }
                    fromPrefix = '';
                });
                config.from = fromPrefix + config.from;
            }
        });
        
        // Allow filtering
        await ConfigGenUtil.addPlugin(PluginIdentifier.COPY, context, {patterns: copyToAdd},
            config => new CopyWebpackPlugin(config));
    }
}