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
 * Last modified: 2021.03.29 at 20:49
 */

import type {EventEmitter} from '@labor-digital/helferlein';
import {forEach, isPlainObject} from '@labor-digital/helferlein';
import type {CoreContext} from '../Core/CoreContext';
import type {WorkerContext} from '../Core/WorkerContext';
import type {EventList} from '../EventList';
import type {IExtensionConfig, IExtensionEventListener} from './types';

export abstract class AbstractExtension
{
    protected _id: string;
    protected _config: IExtensionConfig;
    protected coreContext: CoreContext;
    protected workerContext?: WorkerContext;
    protected eventEmitter: EventEmitter;
    protected scope: 'global' | 'app';
    
    public constructor(
        id: string,
        context: CoreContext | WorkerContext,
        scope: 'global' | 'app'
    )
    {
        this.scope = scope;
        this._config = {};
        this._id = id;
        
        
        if (context.type === 'core') {
            this.coreContext = context;
        } else {
            this.coreContext = context.parentContext;
            this.workerContext = context;
        }
        
        this.eventEmitter = this.coreContext.eventEmitter;
    }
    
    /**
     * Returns the configured options for this extension
     */
    public get options(): IExtensionConfig
    {
        return this._config;
    }
    
    /**
     * Returns the configured id for this extension
     */
    public get id(): string
    {
        return this._id;
    }
    
    /**
     * Returns true, if this extension was registered "globally", in the options.
     * Global extensions run both in the core and for all workers.
     * @protected
     */
    protected get isRegisteredGlobally(): boolean
    {
        return this.scope === 'global';
    }
    
    /**
     * Returns true if this extension was registered in a per-app scope
     * @protected
     */
    protected get isRegisteredInApp(): boolean
    {
        return this.scope === 'app';
    }
    
    /**
     * Returns true, if the script runs in the "core" process
     * @protected
     */
    protected get isCoreProcess(): boolean
    {
        return this.workerContext === undefined;
    }
    
    /**
     * Returns true if the script runs in a "worker" process
     * @protected
     */
    protected get isWorkerProcess(): boolean
    {
        return this.workerContext !== undefined;
    }
    
    /**
     * Initializes this extension by registering the event handlers on the emitter instance
     */
    public abstract initialize(): Promise<void>;
    
    /**
     * Allows you to set additional configuration options for this extension.
     * This should be executed in your "initialize()" method!
     * @param options
     * @protected
     */
    protected setConfig(options: IExtensionConfig): this
    {
        if (options.allowGlobalRegistration === false && this.isRegisteredGlobally) {
            throw new Error('Invalid extension configuration! The extension: "' + this.id +
                            '" was registered globally, but can only be configured on a "per-app" level!');
        }
        
        if (options.allowAppRegistration === false && this.isRegisteredInApp) {
            throw new Error('Invalid extension configuration! The extension: "' + this.id +
                            '" was registered for a single app, but can only be configured on a "global" level!');
        }
        
        if (options.runInCoreProcess === false && this.isCoreProcess ||
            options.runInWorkerProcess === false && this.isWorkerProcess) {
            throw new Error('__SKIP__');
        }
        
        if (isPlainObject(options.events)) {
            forEach(options.events, (callback, e) => {
                this.addListener(e, callback);
            });
        }
        
        this._config = options;
        
        return this;
    }
    
    /**
     * Allows you to register a new event listener for one of the asset builder events
     * This should be executed in your "initialize()" method!
     * @param event The name/identifier of the event to listen to
     * @param listener The listener to execute when the event was triggered
     * @param priority Optional priority to define the order in which listeners should be executed
     * @protected
     */
    protected addListener(
        event: EventList | string,
        listener: IExtensionEventListener,
        priority?: number
    ): this
    {
        this.eventEmitter.bind(event, listener, priority);
        return this;
    }
    
    /**
     * Marker to let the script know this is an extension
     */
    public static get assetExtension(): boolean
    {
        return true;
    }
    
}