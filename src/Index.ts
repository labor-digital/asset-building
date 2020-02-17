#!/usr/bin/env node
import {isObject} from "@labor-digital/helferlein/lib/Types/isObject";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import Chalk from "chalk";
import {Bootstrap} from "./Core/Bootstrap";
import {ProcessManager} from "./Core/ProcessManager";

(new Bootstrap()
	.initMainProcess(require("../package.json"), process.cwd(), __dirname))
	.then(context => (new ProcessManager(context.eventEmitter)).startWorkerProcessesForCoreContext(context))
	.then(() => {
		process.exit(0);
	})
	.catch(err => {
		if (isObject(err) && !isUndefined(err.stack)) err = err.stack;
		console.error("");
		console.error(Chalk.redBright("A FATAL ERROR OCCURRED!\r\nSadly I could not recover :(\r\n"));
		console.error(Chalk.redBright(err));
		console.error("");
		process.exit(1);
	});