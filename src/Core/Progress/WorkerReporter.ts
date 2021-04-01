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
 * Last modified: 2021.03.30 at 15:40
 */

import type {UpdateOptions} from 'multi-progress-bars/dist/multi-progress-bars';
import type {CoreContext} from '../CoreContext';
import type {IReporter} from './types';

export class WorkerReporter implements IReporter
{
    protected _task: string;
    protected _context: CoreContext;
    
    constructor(task: string, context: CoreContext)
    {
        this._task = task;
        this._context = context;
    }
    
    public update(options: UpdateOptions)
    {
        this._context.processManager.sendMessageToParent('PROGRESS_MANAGER', {
            type: 'update',
            name: this._task,
            options: options
        });
        return this;
    }
}