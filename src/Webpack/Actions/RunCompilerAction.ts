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
 * Last modified: 2020.10.21 at 21:48
 */

import type {Stats} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import type {
    ICompilerCallback,
    ICompilerOptions,
    ICompilerResult,
    IWebpackCompilerCallback,
    IWorkerAction
} from './types';

export class RunCompilerAction implements IWorkerAction
{
    
    public async do(context: WorkerContext, options?: ICompilerOptions): Promise<ICompilerResult>
    {
        options = options ?? {};
        
        let outerCallback: ICompilerCallback = () => {};
        if (!options.callback) {
            options.callback = function (err, stats) {
                outerCallback(err, stats);
            };
        }
        
        let compiler = await context.do.makeCompiler(options);
        
        // Nobody except our handler will be able to shut down the script
        context.shutdown.doShutdownWhenCompilingIsDone = false;
        
        const args = await context.eventEmitter.emitHook(EventList.FILTER_WEBPACK_COMPILER, {
            callback: (context: any, stats: any, resolve: any, reject: any): void => {
                this.webpackCallback(context, stats, resolve, reject);
            },
            compiler, options, context
        });
        
        compiler = args.compiler;
        const innerCallback: IWebpackCompilerCallback = args.callback;
        
        return {
            compiler,
            context,
            promise: new Promise(async (resolve, reject) => {
                outerCallback = function (err, stats) {
                    if (err !== null) {
                        return reject(err);
                    }
                    
                    if (context.parentContext.process === 'worker') {
                        process!.send!({WEBPACK_DONE: true});
                    }
                    
                    innerCallback(context, stats!, resolve, reject);
                };
            })
        };
        
    }
    
    /**
     * The default webpack callback which checks if there are errors or warnings and calculates
     * the exit code based on that information
     *
     * @param context
     * @param _
     * @param resolve
     * @param reject
     * @protected
     */
    protected async webpackCallback(
        context: WorkerContext,
        _: Stats,
        resolve: Function,
        reject: Function
    ): Promise<void>
    {
        try {
            if (context.webpackConfig.watch !== true) {
                resolve(context.shutdown.exitCode);
            }
        } catch (e) {
            reject(e);
        }
    }
}