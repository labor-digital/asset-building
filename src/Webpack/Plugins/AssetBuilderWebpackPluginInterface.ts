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
 * Last modified: 2020.10.22 at 10:51
 */

import type {PlainObject} from '@labor-digital/helferlein';
import type {Compiler} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';

export interface AssetBuilderWebpackPluginInterface
{
    
    /**
     * Executed by webpack when the plugin is executed
     * @param compiler
     */
    apply(compiler: Compiler): any;
    
    /**
     * If the plugin defines this method it is executed by the plugin loader and supplied with the correct
     * worker context instance
     * @param context
     */
    setContext?(context: WorkerContext): void;
}

export interface AssetBuilderWebpackPluginStaticInterface
{
    
    new(): AssetBuilderWebpackPluginInterface;
    
    /**
     * Can return the default configuration to apply to the plugin constructor or undefined.
     * The default config will be filtered through the plugin config filter event
     */
    getDefaultConfig?(): PlainObject;
    
}