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
 * Last modified: 2020.10.21 at 17:33
 */

import type {CoreContext} from './CoreContext';
import type {FactoryCoreContextOptions, FactoryWorkerContextOptions} from './Factory.interfaces';
import {CoreContextFactory} from './Factory/CoreContextFactory';
import {WorkerContextFactory} from './Factory/WorkerContextFactory';
import type {WorkerContext} from './WorkerContext';

export class Factory
{
    
    protected _coreContextFactory: CoreContextFactory;
    protected _workerContextFactory: WorkerContextFactory;
    
    public constructor(coreContextFactory?: CoreContextFactory, workerContextFactory?: WorkerContextFactory)
    {
        this._coreContextFactory = coreContextFactory ?? new CoreContextFactory();
        this._workerContextFactory = workerContextFactory ?? new WorkerContextFactory();
    }
    
    /**
     * Creates a new instance of the core context object which resembles the context of the main thread/root application.
     * You need this context to create a worker/app context with
     * @param options
     */
    public makeCoreContext(options?: FactoryCoreContextOptions): Promise<CoreContext>
    {
        return this._coreContextFactory.make(options);
    }
    
    /**
     * Creates a new worker context instance based on the core context and given options
     * @param coreContext
     * @param options
     */
    public makeWorkerContext(coreContext: CoreContext, options?: FactoryWorkerContextOptions): Promise<WorkerContext>
    {
        return this._workerContextFactory.make(coreContext, options);
    }
}