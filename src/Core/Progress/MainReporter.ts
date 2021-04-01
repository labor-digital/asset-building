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
 * Last modified: 2021.03.31 at 12:57
 */

import type {IBarData, IReporter, IReporterUpdateOptions} from './types';

export class MainReporter implements IReporter
{
    protected _name: string;
    protected _data: IBarData;
    protected _triggerUpdate: Function;
    
    constructor(name: string, data: IBarData, triggerUpdate: Function)
    {
        this._name = name;
        this._data = data;
        this._triggerUpdate = triggerUpdate;
    }
    
    public update(options: IReporterUpdateOptions)
    {
        this._data.percent = options.percent;
        this._data.message = options.message ?? '';
        this._triggerUpdate();
        return this;
    }
}