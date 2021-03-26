#!/usr/bin/env node
/*
 * Copyright 2021 LABOR.digital
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
 * Last modified: 2021.03.26 at 12:10
 */

import {isUndefined} from '@labor-digital/helferlein';
import {Command} from 'commander';
import {Bootstrap} from './Core/Bootstrap';
import {ProcessManager} from './Core/ProcessManager';
import {GeneralHelper} from './Helpers/GeneralHelper';

const program = new Command();
program.version(require('../package.json').version);

program.option('--watch', 'if set, webpack will watch your files for changes and automatically recompile');
program.option('--devServer', 'enables the webpack dev server');
program.option('--app', 'the numeric index of an app inside of "apps". Allows to build only a single app');

program.arguments('[mode]');

program.action(async function (mode, args) {
    try {
        const bootstrap = new Bootstrap();
        const context = await bootstrap.initMainProcess({
            watch: args.watch ?? false,
            devServer: args.devServer ?? false,
            mode
        });
        const manager = new ProcessManager(context.eventEmitter);
        
        if (!isUndefined(args.app)) {
            await manager.startSingleWorker(context, parseInt(args.app));
        } else {
            await manager.startWorkers(context);
        }
        
        process.exit(0);
    } catch (e) {
        GeneralHelper.renderError(e);
    }
});

program.parse();