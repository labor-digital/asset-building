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

import {EventEmitter, filter, isPlainObject} from '@labor-digital/helferlein';
import Chalk from 'chalk';
import childProcess from 'child_process';
import {EventList} from '../EventList';
import type {CoreContext} from './CoreContext';

export class ProcessManager
{
    
    /**
     * The list of all processes we have to shutdown
     */
    protected shutdownList: Array<Function>;
    
    public constructor(eventEmitter: EventEmitter)
    {
        this.shutdownList = [];
        
        // Allow synchronous shutdown of all worker processes
        eventEmitter.bind(EventList.SHUTDOWN, () => {
            return Promise.all(filter(this.shutdownList, (v) => v()));
        });
    }
    
    /**
     * Forks a new worker process for each app that is defined in the core context
     *
     * @param coreContext
     */
    public startWorkers(coreContext: CoreContext): Promise<any | void>
    {
        console.log('Beginning to spawn worker processes...');
        const processes: Array<Promise<any | void>> = [];
        
        // Starting the workers in async mode
        const apps = coreContext.laborConfig.apps ?? [];
        for (let i = 0; i < apps.length; i++) {
            processes.push(this.startSingleWorker(coreContext, i));
        }
        
        // Return the combined promise
        return Promise.all(processes);
    }
    
    /**
     * Creates a new worker process for a given app definition
     * @param coreContext
     * @param appIndex
     */
    public startSingleWorker(coreContext: CoreContext, appIndex: number): Promise<void>
    {
        const apps = coreContext.laborConfig.apps ?? [];
        const app = apps[appIndex] ?? null;
        
        if (!isPlainObject(app)) {
            throw new Error('Failed to spawn worker for app with index: ' + appIndex +
                            ' because it does not exist in the "apps" definition!');
        }
        
        if (!app.id) {
            app.id = appIndex;
        }
        
        // Start the process
        return new Promise<void>((resolve, reject) => {
            
            // Check if the app is disabled
            if (app.disabled) {
                console.log(Chalk.yellowBright('Ignoring app: ' + app.appName + ' because it was disabled!'));
                return resolve();
            }
            
            // Create a new fork
            const worker = childProcess.fork(coreContext.assetBuilderPath + 'Worker.js');
            console.log('Spawned worker process: ' + app.id + ' (' + worker.pid + ')');
            let stopped = false;
            
            // Allow custom actions on the worker
            coreContext.eventEmitter.emit(EventList.PROCESS_CREATED, {
                process: worker,
                app: app,
                context: coreContext
            });
            
            // Register shutdown handler for this worker
            this.shutdownList.push(() => {
                return new Promise<void>(resolve1 => {
                    if (stopped) {
                        return resolve1();
                    }
                    console.log('Shutting down worker process: ' + app.id + ' (' + worker.pid + ')');
                    // Stop the work process
                    worker.send({SHUTDOWN: true});
                    const forceTimeout = setTimeout(() => {
                        if (!stopped) {
                            console.log('Forcefully killing worker process: ' + app.id + ' (' + worker.pid + ')');
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
            
            // Start the work process
            worker.send({
                context: coreContext.toJson(),
                app: JSON.stringify(app)
            });
            
            // Resolve the promise if the child was closed
            worker.on('exit', (code) => {
                if (stopped) {
                    return;
                }
                stopped = true;
                
                // Check if we got an error
                if (code !== 0 && code !== null) {
                    coreContext.eventEmitter.emitHook(EventList.SHUTDOWN, {})
                               .then(() => {
                                   reject(new Error(
                                       'The worker process no. ' + app.id + ' was closed with a non-zero exit code!'));
                               });
                    return;
                }
                
                console.log('Worker process no. ' + app.id + ' finished');
                resolve();
            });
        });
    }
}
