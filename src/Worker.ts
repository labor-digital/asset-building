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

import {EventBus, PlainObject} from '@labor-digital/helferlein';
import {Bootstrap} from './Core/Bootstrap';
import {EventList} from './EventList';
import {GeneralHelper} from './Helpers/GeneralHelper';

let isRunning = false;

async function init(message: PlainObject)
{
    try {
        const bootstrap = new Bootstrap();
        const context = await bootstrap.initWorkerProcess(message);
        const res = await context.do.runCompiler();
        process.exit(await res.promise);
    } catch (e) {
        GeneralHelper.renderError(e, 'ERROR IN WORKER PROCESS:');
    }
}

process.on('message', (message: PlainObject) => {
    if (message.SHUTDOWN === true) {
        console.log('Starting worker process (' + process.pid + ') shutdown...');
        EventBus.emitHook(EventList.SHUTDOWN, {}).then(() => process.exit(0));
    } else if (!isRunning) {
        init(message);
    }
});

process.on('SIGTERM', function () {
    console.log('Stopping worker process!');
    process.exit(0);
});