#!/usr/bin/env node
import {Command} from "commander";
import {Bootstrap} from "./Core/Bootstrap";
import {ProcessManager} from "./Core/ProcessManager";
import {GeneralHelper} from "./Helpers/GeneralHelper";

const pJson = require("../package.json");

const program = new Command();
program.version(pJson.version);

program.option("-w, --watch", "if set, webpack will watch your files for changes and automatically recompile");
program.option("-d, --devServer", "enables the webpack dev server");

program.arguments("[mode]");
program.action(function (mode, args) {
	console.log("mode", mode, args.watch ?? false);
	(new Bootstrap())
		.initMainProcess({
			watch: args.watch ?? false,
			mode
		})
		.then(context =>
			(new ProcessManager(context.eventEmitter))
				.startWorkerProcessesForCoreContext(context)
		)
		.then(() => {
			process.exit(0);
		})
		.catch(err => {
			GeneralHelper.renderError(err);
		});

});

program.parse();

