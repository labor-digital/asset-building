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
 * Last modified: 2019.10.05 at 20:50
 */

import type {WorkerContext} from '../../../Core/WorkerContext';
import {EventList} from '../../../EventList';
import {LoaderIdentifier, RuleIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class JsPreloadConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        // The "source-map" loader is technically a pre-loader but does not apply to the default js rules,
        // as it does include ALL javascript files, including those in node_modules
        await ConfigGenUtil.addRule(RuleIdentifier.JS_SOURCE_MAP, context, /\.js$/, {
            enforce: 'pre',
            use: await ConfigGenUtil
                .makeRuleUseChain(RuleIdentifier.JS_SOURCE_MAP, context)
                .addLoader(LoaderIdentifier.JS_SOURCE_MAP, {
                    loader: 'source-map-loader'
                })
                .finish()
        });
        
        let args = await context.eventEmitter.emitHook(EventList.FILTER_JS_PRE_LOADERS, {
            loaders: [], context
        });
        
        const loaders: Array<any> = args.loaders;
        if (loaders.length === 0) {
            return;
        }
        
        await ConfigGenUtil.addJsRule(RuleIdentifier.JS_PRE, context, /\.js$|\.jsx$|\.ts$|\.tsx$/, {
            enforce: 'pre',
            use: await ConfigGenUtil
                .makeRuleUseChain(RuleIdentifier.JS_PRE, context)
                .addRaw(loaders)
                .finish()
        });
    }
}