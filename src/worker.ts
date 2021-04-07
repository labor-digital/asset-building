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
 * Last modified: 2019.10.05 at 17:02
 */

import {EventBus, isArray, PlainObject} from '@labor-digital/helferlein';
import {isPlainObject} from 'webpack-merge/dist/utils';
import type {Bootstrap} from './Core/Bootstrap';
import {Dependencies} from './Core/Dependencies';
import {IncludePathRegistry} from './Core/IncludePathRegistry';
import {EventList} from './EventList';

let isRunning = false;

async function init(message: PlainObject)
{
    try {
        if (message.paths && isArray(message.paths)) {
            IncludePathRegistry.import(message.paths);
        }
        
        if (message.dependencies && isPlainObject(message.dependencies)) {
            Dependencies.import(message.dependencies);
        }
        
        const bootstrap: Bootstrap = new (require('./Core/Bootstrap').Bootstrap as any)();
        const context = await bootstrap.initWorkerProcess(message);
        
        if (context.parentContext.options.devServer && context.app.devServer !== false) {
            await context.do.runDevServer();
        } else {
            const res = await context.do.runCompiler();
            process.exit(await res.promise);
        }
    } catch (e) {
        process.send!({
            assetFatalError: true,
            error: e.stack
        });
    }
}

process.on('message', (message: PlainObject) => {
    if (message.SHUTDOWN === true) {
        EventBus.emitHook(EventList.SHUTDOWN, {}).then(() => process.exit(0));
    } else if (!isRunning) {
        init(message);
    }
});

process.on('SIGTERM', function () {
    process.exit(0);
});