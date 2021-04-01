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

import {isPlainObject, isUndefined, PlainObject} from '@labor-digital/helferlein';
import {EventList} from '../EventList';
import {GeneralHelper} from '../Helpers/GeneralHelper';
import {CoreContext} from './CoreContext';
import {CoreFixes} from './CoreFixes';
import {Factory} from './Factory';
import type {IAppDefinition, IBuilderOptions} from './types';
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
    public async initMainProcess(options?: IBuilderOptions): Promise<CoreContext>
    {
        GeneralHelper.renderFancyIntro();
        
        const context = await this._factory.makeCoreContext(options);
        this.applyEnvironmentFixes();
        this.bindMainProcessEventHandlers(context);
        
        return context;
    }
    
    /**
     * Initializes the worker context object for a single webpack compiler process
     * @param message
     */
    public async initWorkerProcess(message: PlainObject): Promise<WorkerContext>
    {
        // Validate given message
        if (!isPlainObject(message) || isUndefined(message.context)) {
            throw new Error('The worker process did not receive a context!');
        }
        
        if (isUndefined(message.app)) {
            throw new Error('The worker process did not receive a app definition!');
        }
        
        // Warm up the core context
        const coreContext = CoreContext.fromJson(message.context, 'worker');
        const app: IAppDefinition = JSON.parse(message.app);
        coreContext.io.setAppName(app.appName ?? 'LIMBO:App - ' + app.id);
        this.applyEnvironmentFixes();
        
        // Create the worker context using the factory
        this.bindWorkerProcessEventHandlers(coreContext);
        const worker = await this._factory.makeWorkerContext(coreContext, app);
        coreContext.io.setAppName(worker.app.appName!);
        
        
        return worker;
    }
    
    /**
     * Applies some environment fixes that are required to run our package
     */
    protected applyEnvironmentFixes(): void
    {
        if (fixesApplied) {
            return;
        }
        
        fixesApplied = true;
        CoreFixes.eventsJsUncaughtErrorFix();
    }
    
    /**
     * Binds the required event handlers to the process to listen to a shutdown event
     * @param context
     * @protected
     */
    protected bindMainProcessEventHandlers(context: CoreContext): void
    {
        let isShuttingDown = false;
        const shutdownHandler = async function () {
            if (isShuttingDown) {
                return;
            }
            isShuttingDown = true;
            
            context.logger.debug('Starting main process shutdown...');
            await context.eventEmitter!.emitHook(EventList.SHUTDOWN, {});
            context.logger.debug('Good bye!');
            process.exit(0);
        };
        
        process.on('exit', shutdownHandler);
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
    }
    
    /**
     * Binds the required event handlers to the process to listen to a shutdown event
     * @param context
     * @protected
     */
    protected bindWorkerProcessEventHandlers(context: CoreContext): void
    {
        const shutdownHandler = async function () {
            context.logger.debug('Starting worker process shutdown...');
            await context.eventEmitter!.emitHook(EventList.SHUTDOWN, {});
            process.exit(0);
        };
        process.on('SIGTERM', shutdownHandler);
        process.on('SIGINT', shutdownHandler);
    }
    
}