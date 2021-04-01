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
 * Last modified: 2020.10.21 at 21:29
 */

import type {Compiler, Configuration} from 'webpack';
import type {WorkerContext} from '../Core/WorkerContext';
import {MakeCompilerAction} from './Actions/MakeCompilerAction';
import {MakeConfigAction} from './Actions/MakeConfigAction';
import {MakeEnhancedConfigAction} from './Actions/MakeEnhancedConfigAction';
import {RunCompilerAction} from './Actions/RunCompilerAction';
import {RunDevServerAction} from './Actions/RunDevServerAction';
import type {
    ICompilerOptions,
    ICompilerResult,
    IMakeConfigActionOptions,
    IMakeEnhancedConfigActionOptions,
    IRunDevServerOptions
} from './Actions/types';

export class WebpackWorkerActions
{
    
    /**
     * The context which is used to do the actions
     * @protected
     */
    protected _context: WorkerContext;
    
    public constructor(context: WorkerContext)
    {
        this._context = context;
    }
    
    /**
     * Creates a new webpack compiler instance for the generated config to be executed
     * @param options
     */
    public makeCompiler(options?: ICompilerOptions): Promise<Compiler>
    {
        return (new MakeCompilerAction()).do(this._context, options);
    }
    
    /**
     * Allows you to run a webpack compiler based on your current worker configuration
     * @param options
     */
    public runCompiler(options?: ICompilerOptions): Promise<ICompilerResult>
    {
        return (new RunCompilerAction()).do(this._context, options);
    }
    
    /**
     * Boots up the webpack dev server for the current worker process
     * @param options
     */
    public runDevServer(options?: IRunDevServerOptions): Promise<any>
    {
        return (new RunDevServerAction()).do(this._context, options);
    }
    
    /**
     * Creates a complete webpack configuration object and and returns it, wrapped inside a promise
     * @param options
     */
    public makeConfig(options?: IMakeConfigActionOptions): Promise<Configuration>
    {
        return (new MakeConfigAction()).do(this._context, options);
    }
    
    /**
     * Allows you to enhance an existing webpack configuration object with the one build by this implementation
     *
     * @param baseConfig
     * @param options
     */
    public makeEnhancedConfig(
        baseConfig: Configuration,
        options?: IMakeEnhancedConfigActionOptions
    ): Promise<Configuration>
    {
        return (new MakeEnhancedConfigAction()).do(this._context, baseConfig, options);
    }
}