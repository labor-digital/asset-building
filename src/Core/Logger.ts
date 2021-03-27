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

export class Logger
{
    /**
     * True if the logged messages should be shown
     * @protected
     */
    protected _verbose: boolean;
    
    /**
     * An app name that should be prepended for a log output
     * @protected
     */
    protected _name: string;
    
    constructor(verbose: boolean, name?: string)
    {
        this._verbose = verbose;
        this._name = name ?? 'CORE';
    }
    
    /**
     * Updates the name to be shown
     * @param name
     */
    public setName(name: string): void
    {
        this._name = name;
    }
    
    /**
     * Logs the given message if "verbose" is set to true
     * @param message
     */
    public log(message: string): this
    {
        if (this._verbose) {
            console.log('[' + this._name + ']: ' + message);
        }
        return this;
    }
}