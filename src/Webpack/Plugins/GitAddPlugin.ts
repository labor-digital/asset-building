/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.10.22 at 11:29
 */

import Chalk from 'chalk';
import type {Compiler} from 'webpack';
import {AssetBuilderEventList} from '../../AssetBuilderEventList';
// @ts-ignore
import {WorkerContext} from '../../Core/WorkerContext';
// @ts-ignore
import {
    AssetBuilderWebpackPluginInterface,
    AssetBuilderWebpackPluginStaticInterface
} from './AssetBuilderWebpackPluginInterface';

export const GitAddPlugin: AssetBuilderWebpackPluginStaticInterface =
    class implements AssetBuilderWebpackPluginInterface
    {
        
        protected _context?: WorkerContext;
        
        public setContext(context: WorkerContext): void
        {
            this._context = context;
        }
        
        public apply(compiler: Compiler)
        {
            
            // Don't add files to git if we are watching
            // Or if git add was disabled
            if (!this._context || this._context.webpackConfig.watch || this._context.app.disableGitAdd === true) {
                return;
            }
            
            compiler.hooks.done.tap('GitAddPlugin', (statsRaw) => {
                let stats = statsRaw.toJson({
                    assets: true,
                    errorDetails: false,
                    publicPath: true
                });
                
                return this._context!.eventEmitter.emitHook(AssetBuilderEventList.BEFORE_GIT_ADD, {
                    context: this._context
                }).then(() => {
                    try {
                        const childProcess = require('child_process');
                        childProcess.execSync('git add ' + stats.outputPath, {stdio: 'pipe'});
                        console.log(
                            Chalk.greenBright(
                                'The built files in ' + stats.outputPath!.substr(-50) + ' were added to git!')
                        );
                    } catch (e) {
                        console.log(
                            Chalk.yellowBright('Failed to automagically add files in ' + stats.outputPath + ' to git')
                        );
                    }
                });
            });
        }
        
    };