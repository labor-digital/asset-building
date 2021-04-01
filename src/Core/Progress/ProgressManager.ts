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
import type {PlainObject} from '@labor-digital/helferlein';
import ci from 'ci-info';
import type {CoreContext} from '../CoreContext';
import {MainReporter} from './MainReporter';
import {NoopReporter} from './NoopReporter';
import {Renderer} from './Renderer';
import type {IBarData, IReporter, TBarMap} from './types';
import {WorkerReporter} from './WorkerReporter';

export class ProgressManager
{
    protected _initialized: boolean = false;
    protected _context: CoreContext;
    
    protected _renderer?: Renderer;
    protected _reporters: Map<string, IReporter> = new Map();
    protected _bars: TBarMap = new Map();
    
    constructor(context: CoreContext)
    {
        this._context = context;
        
        // Skip if we are running in a CI environment
        if (ci.isCI) {
            return;
        }
        
        if (this._context.process === 'main') {
            this.initializeMainProcess();
        } else {
            this.initializeWorkerProcess();
        }
    }
    
    /**
     * Returns a new reporter instance for a certain app name
     * @param name
     */
    public getReporter(name: string): IReporter
    {
        // If we are running in a ci environment we do nothing, to avoid console spam
        if (ci.isCI) {
            return new NoopReporter();
        }
        
        if (this._reporters.has(name)) {
            return this._reporters.get(name)!;
        }
        
        if (this._context.process === 'main') {
            const data: IBarData = {percent: 0, message: ''};
            this._bars.set(name, data);
            this._renderer!.render();
            return new MainReporter(name, data,
                () => this._renderer!.render());
        }
        
        return new WorkerReporter(name, this._context);
    }
    
    protected initializeMainProcess(): void
    {
        // Create the renderer instance
        this._renderer = new Renderer(this._context.eventEmitter, this._bars);
        
        // Set up our message listener for inter-process communication
        this._context.processManager.addMessageListener('PROGRESS_MANAGER', (data: PlainObject) => {
            const reporter = this.getReporter(data.name);
            
            switch (data.type) {
                case 'update':
                    reporter.update(data.options);
                    break;
            }
        });
        
        // Register the renderer as log writer
        this._renderer.registerLogWriter(this._context.io);
    }
    
    protected initializeWorkerProcess(): void
    {
        const processManager = this._context.processManager;
        
        // In a worker this._context -> there might be a sub-sub process running, so we just pass the information through
        processManager.addMessageListener('PROGRESS_MANAGER', (data: PlainObject) => {
            processManager.sendMessageToParent('PROGRESS_MANAGER', data);
        });
    }
}