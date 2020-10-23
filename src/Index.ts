#!/usr/bin/env node
import {Bootstrap} from "./Core/Bootstrap";
import {ProcessManager} from "./Core/ProcessManager";
import {GeneralHelper} from "./Helpers/GeneralHelper";

(new Bootstrap())
	.initMainProcess()
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