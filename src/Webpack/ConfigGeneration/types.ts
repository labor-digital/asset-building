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
 * Last modified: 2021.03.29 at 22:33
 */

import type {PlainObject} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../Core/WorkerContext';
import type {LoaderIdentifier} from '../../Identifier';

export interface IPluginProvider<T = any>
{
    (config: T): any
}

export interface IConfigurator
{
    apply(context: WorkerContext): Promise<void>
}

export interface IRuleUseChainCollector
{
    /**
     * Add the configuration of a single loader to the use chain
     *
     * @param identifier a unique identifier for the loader, that allows extensions to filter the config
     * @param config
     */
    addLoader(
        identifier: LoaderIdentifier | string,
        config: PlainObject
    ): IRuleUseChainCollector
    
    /**
     * Allows you to add raw loader options -> While possible, this is discouraged! Use addLoader() whenever you can!
     * @param list
     */
    addRaw(list: Array<any>): IRuleUseChainCollector
    
    /**
     * Builds the use list, executes filters and returns the gathered list of loaders
     */
    finish(): Promise<Array<any>>
}