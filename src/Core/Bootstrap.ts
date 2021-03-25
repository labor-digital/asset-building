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
 * Last modified: 2019.10.05 at 17:23
 */

import {EventBus, isUndefined, PlainObject} from '@labor-digital/helferlein';
import {AssetBuilderEventList} from '../AssetBuilderEventList';
import {ExtensionLoader} from '../Extension/ExtensionLoader';
import {GeneralHelper} from '../Helpers/GeneralHelper';
import {CoreContext} from './CoreContext';
import {CoreFixes} from './CoreFixes';
import {Factory} from './Factory';
import type {FactoryCoreContextOptions} from './Factory.interfaces';
import type {WorkerContext} from './WorkerContext';

let fixesApplied = false;

export class Bootstrap
{
    
    /**
     * The factory instance to create the contexts with
     * @protected
     */
    protected _factory: Factory;
    
    /**
     * Creates a new bootstrap instance and allows dependency injection
     * @param factory
     */
    public constructor(factory?: Factory)
    {
        this._factory = factory ?? new Factory();
    }
    
    /**
     * Initializes the core context object for the main process,
     * which in turn will spawn worker processes for each app definition.
     * @param options
     */
    public initMainProcess(options?: FactoryCoreContextOptions): Promise<CoreContext>
    {
        
        GeneralHelper.renderFancyIntro();
        
        return this._factory
                   .makeCoreContext(options)
                   .then(c => this.applyEnvironmentFixes(c))
                   .then(c => this.bindMainProcessEventHandlers(c));
        
    }
    
    /**
     * Initializes the worker context object for a single webpack compiler process
     * @param message
     */
    public initWorkerProcess(message: PlainObject): Promise<WorkerContext>
    {
        // Validate given message
        if (isUndefined(message.context)) {
            return Promise.reject(new Error('The worker process did not receive a context!'));
        }
        if (isUndefined(message.app)) {
            return Promise.reject(new Error('The worker process did not receive a app definition!'));
        }
        
        // Warm up the core context and create worker context
        const coreContext = CoreContext.fromJson(message.context);
        coreContext.process = 'worker';
        coreContext.eventEmitter = EventBus.getEmitter();
        coreContext.extensionLoader = new ExtensionLoader();
        
        // Create the worker context using the factory
        return Promise.resolve(coreContext)
                      .then(c => this.bindWorkerProcessEventHandlers(c))
                      .then(c =>
                          this._factory.makeWorkerContext(c, {
                                  app: JSON.parse(message.app),
                                  cloneCoreContext: false
                              })
                              .then(
                                  workerContext => this
                                      .applyEnvironmentFixes(workerContext.parentContext)
                                      .then(() => workerContext)
                              )
                      );
        
    }
    
    /**
     * Applies some environment fixes that are required to run our package
     * @param context
     */
    protected applyEnvironmentFixes(context: CoreContext): Promise<CoreContext>
    {
        if (fixesApplied) {
            return Promise.resolve(context);
        }
        fixesApplied = true;
        CoreFixes.eventsJsUncaughtErrorFix();
        return Promise.resolve(context);
    }
    
    /**
     * Binds the required event handlers to the process to listen to a shutdown event
     * @param context
     * @protected
     */
    protected bindMainProcessEventHandlers(context: CoreContext): Promise<CoreContext>
    {
        const shutdownHandler = function () {
            console.log('Starting main process shutdown...');
            context.eventEmitter!.emitHook(AssetBuilderEventList.SHUTDOWN, {})
                                 .then(() => {
                                     console.log('Good bye!');
                                     process.exit(0);
                                 });
        };
        process.on('SIGTERM', shutdownHandler);
        process.on('SIGINT', shutdownHandler);
        
        // Windows override to detect the kill command
        if (process.platform === 'win32') {
            const rl = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.on('SIGINT', function () {
                // @ts-ignore
                process.emit('SIGINT');
            });
        }
        
        return Promise.resolve(context);
    }
    
    /**
     * Binds the required event handlers to the process to listen to a shutdown event
     * @param context
     * @protected
     */
    protected bindWorkerProcessEventHandlers(context: CoreContext): Promise<CoreContext>
    {
        const shutdownHandler = function () {
            console.log('Starting worker process shutdown...');
            context.eventEmitter!.emitHook(AssetBuilderEventList.SHUTDOWN, {})
                                 .then(() => process.exit(0));
        };
        process.on('SIGTERM', shutdownHandler);
        process.on('SIGINT', shutdownHandler);
        
        return Promise.resolve(context);
    }
    
}