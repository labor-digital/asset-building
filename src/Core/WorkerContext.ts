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
 * Last modified: 2019.10.05 at 18:28
 */
import type {EventEmitter, PlainObject} from '@labor-digital/helferlein';

import type {Configuration} from 'webpack';
import type {ExtensionLoader} from '../Extension/ExtensionLoader';
import {WebpackWorkerActions} from '../Webpack/WebpackWorkerActions';
import type {CoreContext} from './CoreContext';
import type {IO} from './IO';
import type {Logger} from './Logger';
import type {IReporter} from './Progress/types';
import type {IAppDefinition, TBuilderMode} from './types';

export class WorkerContext
{
    /**
     * The action handler instance to execute the asset builder actions with
     * @protected
     */
    protected _actionHandler: WebpackWorkerActions;
    
    /**
     * Defines the type of this context
     */
    public type: 'worker';
    
    /**
     * Holds the current app definition
     */
    public app: IAppDefinition;
    
    /**
     * Contains the webpack configuration we are currently working on
     */
    public webpackConfig: Configuration | PlainObject;
    
    /**
     * The core context object that is used for this context object
     */
    public parentContext: CoreContext;
    
    /**
     * The progress reporter instance to render nice progress bars
     */
    public progressReporter?: IReporter;
    
    /**
     * Internal flags that define how we should handle the shutdown of the script
     */
    public shutdown: {
        // The numeric exit code to return when the script stopped
        exitCode: number
        // As long as this is set to true, the script will be shut down
        // when the EventProviderPlugin emits the COMPILING_DONE event.
        // This is disabled when the runWebpackCompiler action is executed, as it handles the shutdown internally.
        // Note: This is an additional switch to disable the shutdown! Note, that "watch" must be either undefined
        // or set to false in order for the script to even try a shutdown!
        doShutdownWhenCompilingIsDone: boolean
    } = {
        exitCode: 0,
        doShutdownWhenCompilingIsDone: true
    };
    
    /**
     * Injects the basic configuration
     * @param parentContext
     * @param app
     */
    constructor(parentContext: CoreContext, app: IAppDefinition)
    {
        this.type = 'worker';
        this.parentContext = parentContext;
        this.app = app;
        this.webpackConfig = {};
        this._actionHandler = new WebpackWorkerActions(this);
    }
    
    /**
     * Defines if the current process is the main process or a worker
     */
    public get process(): 'main' | 'worker'
    {
        return this.parentContext.process;
    }
    
    /**
     * The event bus instance we use in this context
     */
    public get eventEmitter(): EventEmitter
    {
        return this.parentContext.eventEmitter;
    }
    
    /**
     * The extension loader instance
     */
    public get extensionLoader(): ExtensionLoader
    {
        return this.parentContext.extensionLoader;
    }
    
    /**
     * Returns the logger instance to write logs with
     */
    public get logger(): Logger
    {
        return this.parentContext.logger;
    }
    
    /**
     * Returns the io instance to write to the output stream
     */
    public get io(): IO
    {
        return this.parentContext.io;
    }
    
    /**
     * The numeric zero-based index of the app which is currently configured.
     */
    public get appId(): number
    {
        return this.app.id ?? 0;
    }
    
    /**
     * True if this app should be executed as webpack "production" mode
     */
    public get isProd(): boolean
    {
        return this.parentContext.isProd;
    }
    
    /**
     * The mode key which was given as cli parameter
     */
    public get mode(): TBuilderMode
    {
        return this.parentContext.mode;
    }
    
    /**
     * Gives you access to all actions you can perform with a worker context
     */
    public get do(): WebpackWorkerActions
    {
        return this._actionHandler;
    }
}
