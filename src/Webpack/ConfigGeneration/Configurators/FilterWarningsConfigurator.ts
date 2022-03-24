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
 * Last modified: 2019.10.06 at 15:55
 */

import {isArray, isString, map} from '@labor-digital/helferlein';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {EventList} from '../../../EventList';
import type {IConfigurator} from '../types';

export class FilterWarningsConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        // Get the warnings to ignore
        let warningsToIgnore: Array<string | RegExp> = (isArray(context.app.warningsIgnorePattern)
            ? context.app.warningsIgnorePattern : (
                isString(context.app.warningsIgnorePattern) ? [context.app.warningsIgnorePattern] : []
            )) as Array<any>;
        
        // Ignore all source-map loader related warnings
        warningsToIgnore.push(/Failed to parse source map/);
        
        // Temporary fix to ignore warnings from a cssnano issue when svg tags are used in font declarations
        // @todo keep track if this was fixed: https://github.com/cssnano/cssnano/issues/1040
        warningsToIgnore.push(/Css Minimizer Plugin: cssnano:/);
        
        // Make sure everything is a regex
        warningsToIgnore = map(warningsToIgnore, (v) => {
            if (isString(v)) {
                return new RegExp(v);
            }
            return v;
        });
        
        const args = await context.eventEmitter.emitHook(EventList.FILTER_WARNING_TO_IGNORE_PATTERNS, {
            patterns: warningsToIgnore,
            context
        });
        
        warningsToIgnore = args.patterns;
        
        // Initialize the webpack configuration to allow us to handle warnings
        if (!context.webpackConfig.ignoreWarnings) {
            context.webpackConfig.ignoreWarnings = [];
        } else if (!isArray(context.webpackConfig.ignoreWarnings)) {
            context.webpackConfig.ignoreWarnings = [context.webpackConfig.ignoreWarnings];
        }
        
        // Create hook function to filter our patterns (It seems, that using patterns directly, is a bit unreliable)
        context.webpackConfig.ignoreWarnings.push(function (warning: string): boolean {
            for (let i = 0; i < warningsToIgnore.length; i++) {
                if ((warningsToIgnore[i] as RegExp).test(warning)) {
                    return true;
                }
            }
            return false;
        });
    }
}