/*
 * Copyright 2021 LABOR.digital
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
 * Last modified: 2021.04.06 at 18:04
 */

import type {Compiler} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import type {IAssetBuilderPlugin, IAssetBuilderPluginStatic} from './types';

export const EventProviderPlugin: IAssetBuilderPluginStatic = class implements IAssetBuilderPlugin
{
    
    protected _context?: WorkerContext;
    
    public setContext(context: WorkerContext): void
    {
        this._context = context;
    }
    
    public apply(compiler: Compiler): any
    {
        compiler.hooks.done.tapAsync({
            name: 'EventProviderPlugin',
            stage: 8888
        }, async (statsRaw, callback) => {
            let stats = statsRaw.toJson({
                assets: true,
                errorDetails: false,
                publicPath: true
            });
            
            let exitCode = stats.warnings && stats.warnings.length > 0 ||
                           stats.errors && stats.errors.length > 0 ? 2 : 0;
            
            let args = await this._context!.eventEmitter.emitHook(EventList.COMPILING_DONE, {
                stats, statsRaw, context: this._context!, exitCode
            });
            
            this._context!.shutdown.exitCode = args.exitCode;
            
            if (!this._context?.webpackConfig.watch && this._context?.shutdown.doShutdownWhenCompilingIsDone) {
                setTimeout(async () => {
                    this._context!.logger.debug('Beginning a graceful shutdown!');
                    
                    await this._context?.eventEmitter.emitHook(EventList.SHUTDOWN, {});
                    
                    process.exit(args.exitCode);
                }, 500);
            }
            
            callback();
        });
    }
};