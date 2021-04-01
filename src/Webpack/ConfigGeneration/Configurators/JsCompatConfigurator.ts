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
 * Last modified: 2019.10.05 at 21:31
 */

import {isArray, isString} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {GeneralHelper} from '../../../Helpers/GeneralHelper';
import {LoaderIdentifier, RuleIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class JsCompatConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        if (!isArray(context.app.jsCompat) || context.app.jsCompat.length === 0) {
            return Promise.resolve();
        }
        
        await GeneralHelper.awaitingForEach(context.app.jsCompat, async (config, k) => {
            // Validate
            if (typeof config !== 'object') {
                throw new Error('Invalid js compat configuration at key: ' + k);
            }
            
            if (!isString(config.rule) || config.rule.trim().length === 0) {
                throw new Error('Invalid or missing js compat "rule" at key: ' + k);
            }
            
            if (typeof config!.options !== 'undefined') {
                return ConfigGenUtil.addRule(RuleIdentifier.JS_COMPAT, context, new RegExp(config.rule), {
                    use: await ConfigGenUtil
                        .makeRuleUseChain(RuleIdentifier.JS_COMPAT, context)
                        .addLoader(LoaderIdentifier.IMPORTS, {
                            loader: 'imports-loader',
                            options: config.options
                        })
                        .finish()
                });
            }
            
            if (typeof config.fix !== 'string' || config.fix.trim().length === 0) {
                throw new Error('Invalid or missing js compat "fix" at key: ' + k);
            }
            
            // Add imports loader if fix misses it
            if (config.fix.indexOf('imports-loader?') !== 0) {
                config.fix = 'imports-loader?' + config.fix;
            }
            
            // Add new module
            return ConfigGenUtil.addRule(RuleIdentifier.JS_COMPAT, context, new RegExp(config.rule), {
                loader: config.fix
            });
        });
        
        return Promise.resolve();
    }
}