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
 * Last modified: 2019.10.05 at 17:25
 */

import {filter, forEach, isFunction, isPlainObject} from '@labor-digital/helferlein';
import childProcess from 'child_process';
import path from 'path';
import {EventList} from '../EventList';
import {GeneralHelper} from '../Helpers/GeneralHelper';
import type {CoreContext} from './CoreContext';
import {Dependencies} from './Dependencies';
import {IncludePathRegistry} from './IncludePathRegistry';
import type {IAppDefinition, IProcessMessageListener, ISingleWorkerOptions} from './types';

export class ProcessManager
{
    
    /**
     * The list of all processes we have to shutdown
     */
    protected shutdownList: Array<Function>;
    
    /**
     * The core context instance
     * @protected
     */
    protected context: CoreContext;
    
    /**
     * A list of registered listeners
     * @protected
     */
    protected listeners: Array<{
        namespace: string,
        listener: IProcessMessageListener
    }>;
    
    public constructor(context: CoreContext)
    {
        this.shutdownList = [];
        this.listeners = [];
        
        this.context = context;
        
        // Allow synchronous shutdown of all worker processes
        context.eventEmitter.bind(EventList.SHUTDOWN, () => {
            return Promise.all(filter(this.shutdownList, (v) => v()));
        });
    }
    
    /**
     * Forks a new worker process for each app that is defined in the core context
     */
    public startWorkers(): Promise<any | void>
    {
        this.context.logger.debug('Beginning to spawn worker processes...');
        const processes: Array<Promise<any | void>> = [];
        
        forEach(this.context.options.apps ?? [], app => {
            processes.push(this.startSingleWorker(app));
        });
        
        return Promise.all(processes);
    }
    
    /**
     * Creates a new worker process for a given app definition
     * @param app
     * @param options
     */
    public startSingleWorker(app: IAppDefinition, options?: ISingleWorkerOptions): Promise<void>
    {
        options = options ?? {};
        
        // Start the process
        return new Promise<void>(async (resolve, reject) => {
            
            // Create a new fork
            let worker = childProcess.fork(
                path.join(this.context.paths.assetBuilder, 'worker.js')
            );
            
            if (isFunction(options!.onCreate ?? false)) {
                worker = await options!.onCreate!(worker, app);
                if (!worker) {
                    throw new Error('"onCreate" failed, no child process object was returned!');
                }
            }
            
            this.context.logger.debug('Spawned worker process: ' + app.id + ' (' + worker.pid + ')');
            let stopped = false;
            
            // Allow custom actions on the worker
            this.context.eventEmitter.emit(EventList.PROCESS_CREATED, {
                process: worker,
                app: app,
                context: this.context
            });
            
            // Register shutdown handler for this worker
            this.shutdownList.push(() => {
                return new Promise<void>(resolve1 => {
                    if (stopped) {
                        return resolve1();
                    }
                    this.context.logger.debug('Shutting down worker process: ' + app.id + ' (' + worker.pid + ')');
                    
                    // Stop the work process
                    worker.send({SHUTDOWN: true});
                    
                    const forceTimeout = setTimeout(() => {
                        if (!stopped) {
                            this.context.logger.debug(
                                'Forcefully killing worker process: ' + app.id + ' (' + worker.pid + ')');
                            worker.kill('SIGTERM');
                        }
                    }, 5000);
                    
                    worker.on('close', () => {
                        clearTimeout(forceTimeout);
                        stopped = true;
                        resolve1();
                    });
                });
            });
            
            // Register message listeners
            worker.on('message', async (msg: any) => {
                if (!isPlainObject(msg)) {
                    return;
                }
                
                // Handle fatal errors
                if (msg.assetFatalError) {
                    await this.context.eventEmitter.emitHook(EventList.SHUTDOWN, {});
                    GeneralHelper.renderError(msg.error,
                        'FATAL ERROR IN WORKER PROCESS: ' + app.id + ' (' + worker.pid + ')');
                    return;
                }
                
                // Handle data messages
                if (msg.assetMessage) {
                    forEach(this.listeners, listener => {
                        if (listener.namespace !== msg.namespace) {
                            return;
                        }
                        listener.listener(msg.data, msg.namespace, worker);
                    });
                }
            });
            
            // Start the work process
            worker.send({
                context: this.context.toJson(),
                app: JSON.stringify(app),
                paths: IncludePathRegistry.export(),
                dependencies: Dependencies.export()
            });
            
            // Resolve the promise if the child was closed
            worker.on('exit', (code) => {
                if (stopped) {
                    resolve();
                    return;
                }
                stopped = true;
                
                // Check if we got an error
                if (code !== 0 && code !== null) {
                    this.context.eventEmitter.emitHook(EventList.SHUTDOWN, {})
                        .then(() => {
                            reject(new Error(
                                'The worker process no. ' + app.id + ' was closed with a non-zero exit code!'));
                        });
                    return;
                }
                
                this.context.logger.debug('Worker process no. ' + app.id + ' finished');
                resolve();
            });
        });
    }
    
    /**
     * Allows a worker process to send any kind of data to the core process
     * @param namespace
     * @param data
     */
    public sendMessageToParent(namespace: string, data: any): void
    {
        if (!process.send) {
            throw new Error('Can\'t send a message to the parent process, because we are already in the core process!');
        }
        
        process.send({
            assetMessage: true,
            namespace, data
        });
    }
    
    /**
     * Adds a new message listener, which listeners for messages send by a worker process
     * @param namespace
     * @param listener
     */
    public addMessageListener(namespace: string, listener: IProcessMessageListener): void
    {
        this.listeners.push({
            namespace, listener
        });
    }
}
