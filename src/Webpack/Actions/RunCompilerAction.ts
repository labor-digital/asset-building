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

import type {PlainObject} from '@labor-digital/helferlein';
import {isObject, isUndefined} from '@labor-digital/helferlein';
import {Configuration, Stats, webpack} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import type {WebpackCompilerCallbackInterface} from '../../Interfaces/WebpackCompilerCallbackInterface';
import type {RunCompilerOptions, RunCompilerResult} from './RunCompilerAction.interfaces';
import type {WorkerActionInterface} from './WorkerActionInterface';

export class RunCompilerAction implements WorkerActionInterface
{
    
    public async do(context: WorkerContext, options?: RunCompilerOptions): Promise<RunCompilerResult>
    {
        options = options ?? {};
        
        return this.runCompiler(
            await this.prepareConfig(context, options), context, options
        );
        
    }
    
    /**
     * Either loads the configuration from the options or generates a new configuration object
     * @param context
     * @param options
     * @protected
     */
    protected prepareConfig(context: WorkerContext, options?: RunCompilerOptions): Promise<Configuration>
    {
        options = options ?? {};
        
        // Use the given configuration if possible
        if (isObject(options.config)) {
            context.webpackConfig = options.config!;
            return Promise.resolve(options.config!);
        }
        
        return context.do.makeConfiguration(options.configOptions);
    }
    
    /**
     * Runs the actual compiler and wraps the webpack execution into a promise that returns the exit
     * code after webpack finished to compile
     *
     * @param config
     * @param context
     * @param options
     * @protected
     */
    protected runCompiler(
        config: Configuration,
        context: WorkerContext,
        options?: RunCompilerOptions
    ): Promise<RunCompilerResult>
    {
        let compilerInstance: any | null = null;
        
        return new Promise((resolveCompiler, rejectCompiler) => {
            const callbackPromise = (new Promise<number>((resolveCallback, rejectCallback) => {
                this.emitFilterEvent(context, options)
                    .then(args => {
                        const compiler: Function = args.compiler;
                        const context: WorkerContext = args.context;
                        const callback: WebpackCompilerCallbackInterface = args.callback;
                    
                        compilerInstance = compiler(config, (err: any, stats: any) => {
                            if (err !== null) {
                                return rejectCallback(err);
                            }
                        
                            if (context.parentContext.process === 'worker') {
                                process!.send!({WEBPACK_DONE: true});
                            }
                        
                            callback(context, stats, resolveCallback, rejectCallback);
                        });
                    
                        if (compilerInstance === null) {
                            setTimeout(() => {
                                rejectCompiler(new Error('Failed to instantiate webpack'));
                            }, 2000);
                            return;
                        }
                    
                        context.eventEmitter.emit(EventList.WEBPACK_COMPILER, {
                            compilerDefinition: compiler,
                            context,
                            webpackCompiler: compilerInstance
                        });
                    
                        if (!isUndefined(compilerInstance!.compiler)) {
                            compilerInstance = compilerInstance!.compiler;
                        }
                    
                        resolveCompiler({
                            context,
                            compiler: compilerInstance,
                            promise: callbackPromise
                        });
                    })
                    .catch(rejectCompiler);
            }))
                .catch(e => {
                    rejectCompiler(e);
                    return 1;
                });
        });
    }
    
    /**
     * Allows the outside world to filter our settings for the webpack compiler and callback
     * @param context
     * @param options
     * @protected
     */
    protected emitFilterEvent(
        context: WorkerContext,
        options?: RunCompilerOptions
    ): Promise<PlainObject>
    {
        return context.eventEmitter.emitHook(EventList.FILTER_WEBPACK_COMPILER, {
            compiler: webpack,
            callback: (context: any, stats: any, resolve: any, reject: any): void => {
                this.webpackCallback(context, stats, resolve, reject);
            },
            options,
            context
        });
    }
    
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
    protected webpackCallback(context: WorkerContext, statsRaw: Stats, resolve: Function, reject: Function): void
    {
        let stats = statsRaw.toJson({
            assets: true,
            errorDetails: false,
            publicPath: true
        });
        
        context.eventEmitter.emitHook(EventList.COMPILING_DONE, {
                   stats,
                   statsRaw,
                   context
               })
               .then(args =>
                   args.stats.warnings.length > 0 || args.stats.errors.length > 0 ? 1 : 0
               )
               .then(exitCode =>
                   context.eventEmitter.emitHook(EventList.CALLBACK_DONE, {
                       exitWorker: true,
                       stats,
                       exitCode,
                       context
                   })
               )
               .then(args =>
                   args.exitCode > 0 || args.exitWorker ? args.exitCode : -1
               )
               .then(exitCode => {
                   if (exitCode === -1) {
                       console.log('Webpack finished, but I should keep the script running...');
                       return;
                   }
            
                   if (context.webpackConfig.watch !== true) {
                       resolve(exitCode);
                   }
               })
               .catch(err => reject(err));
    }
}