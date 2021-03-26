/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.02.17 at 20:29
 */

import {EventBus, EventEmitter} from '@labor-digital/helferlein';
import type {Application} from 'express';
import {Factory} from '../../Core/Factory';
import type {FactoryCoreContextOptions, FactoryWorkerContextOptions} from '../../Core/Factory.interfaces';
import type {WorkerContext} from '../../Core/WorkerContext';

export default class ExpressContext
{
    /**
     * Defines the type of this context
     */
    public type: 'express';
    
    /**
     * The options the express plugin was initialized with
     */
    public options: FactoryCoreContextOptions;
    
    /**
     * True if express runs in production mode, false if not
     */
    public isProd: boolean;
    
    /**
     * The instance of the event emitter
     */
    public eventEmitter: EventEmitter;
    
    /**
     * The express application we should hook ourselves to
     */
    public expressApp: Application;
    
    /**
     * The factory to create contexts with
     */
    public factory: Factory;
    
    public constructor(expressApp: Application, options?: FactoryCoreContextOptions)
    {
        this.options = options ?? {};
        this.isProd = process.env.NODE_ENV !== 'development';
        this.type = 'express';
        this.expressApp = expressApp;
        this.eventEmitter = EventBus.getEmitter();
        this.factory = new Factory();
    }
    
    /**
     * Helper function to register public assets using the static express middleware!
     * @param directory The directory you want to make public, relative to the project root
     * @param route An optional route that is used to provide the static files
     */
    public registerPublicAssets(directory: string, route?: string)
    {
        const stat = require('express').static(directory, {
            etag: false,
            maxAge: 15 * 60 * 1000
        });
        
        if (typeof route === 'string') {
            this.expressApp.use(route, stat);
        } else {
            this.expressApp.use(stat);
        }
    }
    
    /**
     * Creates and returns a new worker context object, to do stuff with :D
     */
    public async getWorker(options?: FactoryWorkerContextOptions): Promise<WorkerContext>
    {
        const coreContext = await this.factory.makeCoreContext({
            watch: true,
            mode: this.isProd ? 'production' : 'dev',
            ...this.options
        });
        return await this.factory.makeWorkerContext(coreContext, options);
    }
}