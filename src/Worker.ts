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

import {EventBus} from "@labor-digital/helferlein/lib/Events/EventBus";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {AssetBuilderEventList} from "./AssetBuilderEventList";
import {Bootstrap} from "./Core/Bootstrap";
import {GeneralHelper} from "./Helpers/GeneralHelper";

let isRunning = false;

function init(message) {
	(new Bootstrap())
		.initWorkerProcess(message)
		.then(context => context.do.runCompiler())
		.then(res => res.promise)
		.then((exitCode: number) => process.exit(exitCode))
		.catch(err => {
			GeneralHelper.renderError(err, "ERROR IN WORKER PROCESS:");
		});
}

process.on("message", (message: PlainObject) => {
	if (message.SHUTDOWN === true) {
		console.log("Starting worker process (" + process.pid + ") shutdown...");
		EventBus.emitHook(AssetBuilderEventList.SHUTDOWN, {}).then(() => process.exit(0));
	} else if (!isRunning) init(message);
});

process.on("SIGTERM", function () {
	console.log("Stopping worker process!");
	process.exit(0);
});