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
 * Last modified: 2020.10.21 at 21:29
 */

import {isArray, PlainObject} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import {WebpackConfigGenerator} from '../ConfigGeneration/WebpackConfigGenerator';
import type {IMakeConfigActionOptions} from './types';
import type {WorkerActionInterface} from './WorkerActionInterface';

export class MakeConfigAction implements WorkerActionInterface
{
    
    /**
     * @inheritDoc
     */
    public do(context: WorkerContext, options?: IMakeConfigActionOptions): any
    {
        options = options ?? {};
        
        this.bindDisabledElementListener(context, options);
        
        return (new WebpackConfigGenerator())
            .generateConfiguration(context)
            .then(context =>
                context.parentContext.eventEmitter.emitHook(EventList.INTEROP_WEBPACK_CONFIG, {
                    environment: context.parentContext.environment,
                    context,
                    config: context.webpackConfig
                })
            )
            .then(args => args.config);
    }
    
    /**
     * Binds an event listener to disable some configurators if required by the given options
     * @param context
     * @param options
     * @protected
     */
    protected bindDisabledElementListener(context: WorkerContext, options?: IMakeConfigActionOptions): void
    {
        if (!options) {
            return;
        }
        
        if (isArray(options.disable)) {
            context.eventEmitter.bind(EventList.CHECK_IDENTIFIER_STATE, (e: PlainObject) => {
                if (options.disable!.indexOf(e.args.identifier) === -1) {
                    return;
                }
                e.args.enabled = false;
            });
        }
    }
    
}
