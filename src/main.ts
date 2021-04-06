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

import {Command} from 'commander';
import type {Bootstrap} from './Core/Bootstrap';
import {IncludePathRegistry} from './Core/IncludePathRegistry';
import {GeneralHelper} from './Helpers/GeneralHelper';

const program = new Command();
program.version(require('../package.json').version);

program.option('--watch', 'if set, webpack will watch your files for changes and automatically recompile');
program.option('--devServer', 'enables the webpack dev server');
program.option('--app', 'the numeric index of an app inside of "apps". Allows you to build only a single app');
program.option('--verbose', 'enables additional console outputs while the builder runs');

program.arguments('[mode]');

program.action(async function (mode, args) {
    try {
        IncludePathRegistry.register();
        
        const bootstrap: Bootstrap = new (require('./Core/Bootstrap').Bootstrap as any)();
        
        const context = await bootstrap.initMainProcess({
            watch: args.watch ?? false,
            devServer: args.devServer ?? false,
            verbose: args.verbose ?? false,
            app: args.app ? parseInt(args.app) : undefined,
            mode
        });
        
        try {
            await context.processManager.startWorkers();
        } catch (e) {
            GeneralHelper.renderError(e);
        }
        
        process.exit(0);
    } catch (e) {
        GeneralHelper.renderError(e);
    }
});

program.parse();