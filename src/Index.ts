#!/usr/bin/env node
import {Command} from 'commander';
import {Bootstrap} from './Core/Bootstrap';
import {ProcessManager} from './Core/ProcessManager';
import {GeneralHelper} from './Helpers/GeneralHelper';

const pJson = require('../package.json');

const program = new Command();
program.version(pJson.version);

program.option('-w, --watch', 'if set, webpack will watch your files for changes and automatically recompile');
program.option('-d, --devServer', 'enables the webpack dev server');

program.arguments('[mode]');

program.action(async function (mode, args) {
    try {
        const bootstrap = new Bootstrap();
        const context = await bootstrap.initMainProcess({
            watch: args.watch ?? false, mode
        });
        const manager = new ProcessManager(context.eventEmitter);
        await manager.startWorkerProcessesForCoreContext(context);
        process.exit(0);
    } catch (e) {
        GeneralHelper.renderError(e);
    }
});

program.parse();

