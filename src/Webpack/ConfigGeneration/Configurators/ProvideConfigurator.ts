/*
 * Copyright 2019 LABOR.digital
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
 * Last modified: 2019.10.06 at 15:29
 */

import path from 'path';
import {Dependencies} from '../../../Core/Dependencies';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {EventList} from '../../../EventList';
import {PluginIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class ProvideConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        const args = await context.eventEmitter.emitHook(
            EventList.GET_JS_PROVIDES, {
                provides: {
                    process: path.resolve(context.parentContext.paths.assetBuilder, '../static/ProcessPolyfill.js')
                }, context
            });
        
        await ConfigGenUtil.addPlugin(PluginIdentifier.PROVIDE, context, args.provides,
            config => new Dependencies.webpack.ProvidePlugin(config));
    }
    
}