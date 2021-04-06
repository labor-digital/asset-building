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
 * Last modified: 2020.10.22 at 10:33
 */

import {isFunction} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {PluginIdentifier} from '../../../Identifier';
import {EventProviderPlugin} from '../../Plugins/EventProviderPlugin';
import {FancyStatsPlugin} from '../../Plugins/FancyStatsPlugin';
import {GitAddPlugin} from '../../Plugins/GitAddPlugin';
import {ProgressProviderPlugin} from '../../Plugins/ProgressProviderPlugin';
import type {IAssetBuilderPlugin, IAssetBuilderPluginStatic} from '../../Plugins/types';
import {WebpackPromiseShimPlugin} from '../../Plugins/WebpackPromiseShimPlugin';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class BuiltInPluginConfigurator implements IConfigurator
{
    
    public async apply(context: WorkerContext): Promise<void>
    {
        const w = this.registerPluginWrapper;
        await w(PluginIdentifier.PROGRESS_PROVIDER, context, ProgressProviderPlugin);
        await w(PluginIdentifier.EVENT_PROVIDER, context, EventProviderPlugin);
        await w(PluginIdentifier.GIT_ADD, context, GitAddPlugin);
        await w(PluginIdentifier.FANCY_STATS, context, FancyStatsPlugin);
        await w(PluginIdentifier.PROMISE_SHIM, context, WebpackPromiseShimPlugin);
    }
    
    /**
     * Internal helper to run the internal plugin lifecycle including all filter functions
     * @param identifier
     * @param context
     * @param plugin
     * @protected
     */
    protected async registerPluginWrapper(
        identifier: PluginIdentifier,
        context: WorkerContext,
        plugin: IAssetBuilderPluginStatic
    ): Promise<void>
    {
        const config = isFunction(plugin.getDefaultConfig) ? plugin.getDefaultConfig() ?? {} : {};
        
        await ConfigGenUtil.addPlugin(identifier, context, config, (config) => {
            const i: IAssetBuilderPlugin = new (plugin as any)(config);
            
            if (isFunction(i.setContext)) {
                i.setContext(context);
            }
            
            return i;
        });
    }
}