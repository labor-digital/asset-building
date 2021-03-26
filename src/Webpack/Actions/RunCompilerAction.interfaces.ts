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
 * Last modified: 2020.10.21 at 23:05
 */


import type {Compiler, Configuration} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';
import type {MakeConfigurationActionOptions} from './MakeConfigurationAction';

export interface RunCompilerOptions
{
    /**
     * Allows you to manually supply the configuration to run the compiler with.
     * If this is omitted a new configuration is build by the config generator
     */
    config?: Configuration;
    
    /**
     * Allows you to supply your own options when the configuration is generated.
     * Note that this option does nothing if "config" was supplied!
     */
    configOptions?: MakeConfigurationActionOptions
}

export interface RunCompilerResult
{
    /**
     * The context object which was used to start the compiler
     */
    context: WorkerContext;
    
    /**
     * The instance of the webpack compiler that is currently running
     */
    compiler: Compiler
    
    /**
     * The promise that waits until the webpack compilier is finished.
     * It will contain the numeric exit code after it was resolved
     */
    promise: Promise<number>
}