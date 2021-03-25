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
 * Last modified: 2020.04.24 at 11:24
 */

import {Factory} from '../../Core/Factory';
import type {WorkerContext} from '../../Core/WorkerContext';
import type {ExpressAssetBuildingPluginOptions} from './expressAssetBuildingPlugin';

export default class ExpressFactory
{
    /**
     * The express plugin options to extract the app from
     * @protected
     */
    protected _options: ExpressAssetBuildingPluginOptions;
    
    /**
     * The concrete factory to create the asset builder with
     * @protected
     */
    protected _factory: Factory;
    
    /**
     * Injects the factory instance and options
     * @param factory
     * @param options
     */
    public constructor(options: ExpressAssetBuildingPluginOptions, factory?: Factory)
    {
        this._options = options;
        this._factory = factory ?? new Factory();
    }
    
    /**
     * Makes the prepared worker context for the express app
     */
    public getWorkerContext(): Promise<WorkerContext>
    {
        return this._factory.makeCoreContext({
            mode: this._options.mode ?? 'build',
            packageJsonPath: this._options.packageJsonDirectory,
            environment: 'express'
        }).then(coreContext => this._factory.makeWorkerContext(coreContext, {
            app: this._options.appId
        }));
    }
}