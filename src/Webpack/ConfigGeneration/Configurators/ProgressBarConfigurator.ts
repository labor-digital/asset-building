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
 * Last modified: 2019.10.06 at 15:23
 */

// @ts-ignore
import WebpackBar from 'webpackbar';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {PluginIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class ProgressBarConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        return;
        await ConfigGenUtil.addPlugin(PluginIdentifier.PROGRESS_BAR, context, {
            name: context.app.appName,
            basic: true
        }, config => new WebpackBar(config));
    }
}