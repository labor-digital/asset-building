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
 * Last modified: 2021.03.26 at 15:24
 */

import {isObject} from '@labor-digital/helferlein';
import type {Compiler} from 'webpack';
import {Configuration, webpack} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import type {ICompilerOptions, IWorkerAction} from './types';

export class MakeCompilerAction implements IWorkerAction
{
    public async do(context: WorkerContext, options?: ICompilerOptions): Promise<Compiler>
    {
        const config = await this.prepareConfig(context, options);
        
        // Allows the outside world to filter our settings for the webpack compiler and callback
        const args = await context.eventEmitter.emitHook(EventList.FILTER_WEBPACK_COMPILER, {
            compiler: webpack, config, options, context
        });
        
        return args.compiler(config, options?.callback);
    }
    
    /**
     * Either loads the configuration from the options or generates a new configuration object
     * @param context
     * @param options
     * @protected
     */
    protected prepareConfig(context: WorkerContext, options?: ICompilerOptions): Promise<Configuration>
    {
        options = options ?? {};
        
        // Use the given configuration if possible
        if (isObject(options.config)) {
            context.webpackConfig = options.config!;
            return Promise.resolve(options.config!);
        }
        
        return context.do.makeConfig(options.makeConfigOptions);
    }
}