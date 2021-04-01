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
 * Last modified: 2021.03.26 at 20:28
 */

import type {IO} from './IO';

export class Logger
{
    /**
     * True if the logged messages should be shown
     * @protected
     */
    protected _verbose: boolean;
    
    /**
     * The io manager to write the log with
     * @protected
     */
    protected _io: IO;
    
    constructor(io: IO, verbose: boolean)
    {
        this._io = io;
        this._verbose = verbose;
    }
    
    /**
     * Logs the given message/list of arguments
     */
    public info(...args: any): this
    {
        this._io.write(...args);
        return this;
    }
    
    /**
     * Logs the given message/list of arguments, if "verbose" is set to true
     */
    public debug(...args: any): this
    {
        if (this._verbose) {
            this._io.write(...args);
        }
        return this;
    }
}