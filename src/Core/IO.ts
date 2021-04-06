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
 * Last modified: 2021.03.31 at 16:34
 */

import type {PlainObject} from '@labor-digital/helferlein';
import {isNumber, isString, map} from '@labor-digital/helferlein';
import Chalk from 'chalk';
import * as util from 'util';
import {EventList} from '../EventList';
import type {CoreContext} from './CoreContext';
import type {IIOLogWriter} from './types';

declare global
{
    interface Console
    {
        raw: any;
    }
}

export class IO
{
    protected _logWriter: IIOLogWriter;
    protected _appName: string = 'MAIN';
    protected _backup?: PlainObject;
    
    public constructor(context: CoreContext)
    {
        this._logWriter = (...args): void => console.log(...args);
        this.initialize(context);
    }
    
    /**
     * Allows the outside world to modify the registered "console.log" equivalent we use to dump our data to the IO stream
     * @param writer
     */
    public setLogWriter(writer: (...args: any) => void): IIOLogWriter
    {
        const oldWriter = this._logWriter;
        this._logWriter = writer;
        return oldWriter;
    }
    
    /**
     * By default everything is outputted with a "appName" prefix, if workers are spawned in separate processes.
     * This is used to inject the name of the currently running app worker.
     */
    public setAppName(name: string): void
    {
        this._appName = name;
    }
    
    /**
     * This writer will (if running in a worker process) automatically prepend the name of each worker before the output
     * To avoid the "worker" prefix, use writeRaw() instead
     * @param args
     */
    public write(...args: any): void
    {
        this.writeRaw(Chalk.blueBright('[' + this._appName + ']'), ...args);
    }
    
    /**
     * Executes the internally registered log writer to dump the given data into the console.log equivalent
     * @param args
     */
    public writeRaw(...args: any): void
    {
        this._logWriter(...map(args, v => {
            if (isString(v) || isNumber(v)) {
                return v + '';
            }
            return util.inspect(v, false, 4);
        }));
    }
    
    /**
     * Initializes the IO manager by wrapping console.log with our internal log writing logic,
     * that allows us to add a non-flickering progress bar
     * @param context
     * @protected
     */
    protected initialize(context: CoreContext): void
    {
        if (context.process === 'main') {
            // Create the fallback aware console.log writer
            this._logWriter = (...args: any): void => {
                if (this._backup && this._backup.log) {
                    this._backup.log(...args);
                } else {
                    console.log(...args);
                }
            };
            
            // Add listener to watch for child logs
            context.processManager.addMessageListener('IO', (data: PlainObject) => this._logWriter(...data.message));
        } else {
            this._logWriter = (...args: any): void => {
                context.processManager.sendMessageToParent('IO', {message: args});
            };
        }
        
        // Re-write the log, so everything runs through this class
        console.raw = console.log;
        this._backup = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };
        
        const that = this;
        const rewrite = function (...args: any) {
            that.write(...args);
        };
        
        console.log = rewrite;
        console.error = rewrite;
        console.warn = rewrite;
        console.info = rewrite;
        
        // Restore the log back to the original when the script shuts down
        context.eventEmitter.bind(EventList.SHUTDOWN, () => {
            if (this._backup) {
                console.log = this._backup.log;
                console.error = this._backup.error;
                console.warn = this._backup.warn;
                console.info = this._backup.info;
            }
        });
    }
}