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
 * Last modified: 2021.03.31 at 13:09
 */

import type {Compiler} from 'webpack';
import {ProgressPlugin} from 'webpack';
import type {IReporter} from '../../Core/Progress/types';
import type {WorkerContext} from '../../Core/WorkerContext';
import type {IAssetBuilderPlugin, IAssetBuilderPluginStatic} from './types';

export const ProgressProviderPlugin: IAssetBuilderPluginStatic = class extends ProgressPlugin
    implements IAssetBuilderPlugin
{
    /**
     * The worker context this plugin should render the output for
     * @protected
     */
    protected _context?: WorkerContext;
    
    protected _reporter?: IReporter;
    
    constructor()
    {
        super({activeModules: true});
        // @ts-ignore
        this.handler = (percentage: number, message: string, ...additional: string[]) => {
            if (!this._reporter) {
                return;
            }
            
            // const additionalMsg = additional.join(' | ');
            const additionalMsg = additional[0] ?? '';
            const msg = message + (additionalMsg.length > 0 ? ' (' + additionalMsg + ')' : '');
            
            this._reporter.update({percent: percentage, message: msg});
        };
    }
    
    public setContext(context: WorkerContext)
    {
        this._context = context;
        this._reporter = context.progressReporter;
    }
    
    public apply(compiler: Compiler): any
    {
        super.apply(compiler);
        compiler.hooks.afterPlugins.tap('ProgressProvider:afterPlugins', () => {
            this._reporter?.update({percent: 0, message: 'Initializing...'});
        });
        
        compiler.hooks.compile.tap('ProgressProvider:compile', () => {
            this._reporter?.update({percent: 0, message: 'Starting compiler...'});
        });
        
        compiler.hooks.done.tap('ProgressProvider:done', () => {
            this._reporter?.update({percent: 1, message: 'Done'});
        });
    }
    
};