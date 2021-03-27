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
import type {ICompilerCallback, ICompilerOptions, ICompilerResult, IWebpackCompilerCallback} from './types';
import type {WorkerActionInterface} from './WorkerActionInterface';

export class RunCompilerAction implements WorkerActionInterface
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
    
    //
    // /**
    //  * Runs the actual compiler and wraps the webpack execution into a promise that returns the exit
    //  * code after webpack finished to compile
    //  *
    //  * @param config
    //  * @param context
    //  * @protected
    //  */
    // protected async runCompiler(config: Configuration, context: WorkerContext): Promise<any>
    // {
    //     const compiler = context.do.makeCompiler();
    //
    //     let compilerInstance: any | null = null;
    //
    //     return new Promise((resolveCompiler, rejectCompiler) => {
    //         const callbackPromise = (new Promise<number>((resolveCallback, rejectCallback) => {
    //             this.emitFilterEvent(context, options)
    //                 .then(args => {
    //                     const compiler: Function = args.compiler;
    //                     const context: WorkerContext = args.context;
    //                     const callback: WebpackCompilerCallbackInterface = args.callback;
    //
    //                     compilerInstance = compiler(config, (err: any, stats: any) => {
    //                         if (err !== null) {
    //                             return rejectCallback(err);
    //                         }
    //
    //                         if (context.parentContext.process === 'worker') {
    //                             process!.send!({WEBPACK_DONE: true});
    //                         }
    //
    //                         callback(context, stats, resolveCallback, rejectCallback);
    //                     });
    //
    //                     if (compilerInstance === null) {
    //                         setTimeout(() => {
    //                             rejectCompiler(new Error('Failed to instantiate webpack'));
    //                         }, 2000);
    //                         return;
    //                     }
    //
    //                     context.eventEmitter.emit(EventList.WEBPACK_COMPILER, {
    //                         compilerDefinition: compiler,
    //                         context,
    //                         webpackCompiler: compilerInstance
    //                     });
    //
    //                     if (!isUndefined(compilerInstance!.compiler)) {
    //                         compilerInstance = compilerInstance!.compiler;
    //                     }
    //
    //                     resolveCompiler({
    //                         context,
    //                         compiler: compilerInstance,
    //                         promise: callbackPromise
    //                     });
    //                 })
    //                 .catch(rejectCompiler);
    //         }))
    //             .catch(e => {
    //                 rejectCompiler(e);
    //                 return 1;
    //             });
    //     });
    // }
    //
    // /**
    //  * Allows the outside world to filter our settings for the webpack compiler and callback
    //  * @param context
    //  * @param options
    //  * @protected
    //  */
    // protected emitFilterEvent(
    //     context: WorkerContext,
    //     options?: RunCompilerOptions
    // ): Promise<PlainObject>
    // {
    //     return context.eventEmitter.emitHook(EventList.FILTER_WEBPACK_COMPILER, {
    //         compiler: webpack,
    //         callback: (context: any, stats: any, resolve: any, reject: any): void => {
    //             this.webpackCallback(context, stats, resolve, reject);
    //         },
    //         options,
    //         context
    //     });
    // }
    //
    /**
     * The default webpack callback which checks if there are errors or warnings and calculates
     * the exit code based on that information
     *
     * @param context
     * @param statsRaw
     * @param resolve
     * @param reject
     * @protected
     */
    protected async webpackCallback(
        context: WorkerContext,
        statsRaw: Stats,
        resolve: Function,
        reject: Function
    ): Promise<void>
    {
        try {
            let stats = statsRaw.toJson({
                assets: true,
                errorDetails: false,
                publicPath: true
            });
            
            let args = await context.eventEmitter.emitHook(EventList.COMPILING_DONE, {
                stats, statsRaw, context
            });
            
            let exitCode = args.stats.warnings.length > 0 || args.stats.errors.length > 0 ? 1 : 0;
            
            args = await context.eventEmitter.emitHook(EventList.CALLBACK_DONE, {
                exitWorker: true,
                stats,
                exitCode,
                context
            });
            
            exitCode = args.exitCode > 0 || args.exitWorker ? args.exitCode : -1;
            
            if (exitCode === -1) {
                context.parentContext.logger.log('Webpack finished, but I should keep the script running...');
                return;
            }
            
            if (context.webpackConfig.watch !== true) {
                resolve(exitCode);
            }
        } catch (e) {
            reject(e);
        }
        
    }
}