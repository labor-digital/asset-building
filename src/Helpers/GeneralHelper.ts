/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.10.22 at 12:33
 */

import {isObject, isUndefined} from "@labor-digital/helferlein";
import Chalk from "chalk";

export class GeneralHelper {
	/**
	 * Silly helper to render a multilingual intro text including our current version
	 */
	public static renderFancyIntro(): void {
		const version = require("../../package.json").version;

		const lang = [
			["Guten Morgen", "Guten Tag", "Guten Abend"],
			["Good morning", "Good day", "Good evening"],
			["Buenos días", "Buenos días", "Buenas noches"],
			["Bonjour", "Bonne journée", "Bonsoir"],
			["Godmorgen", "God dag", "God aften"],
			["Dobro jutro", "Dobar dan", "Dobra večer"],
			["Maidin mhaith", "Dea-lá", "Dea-oíche"],
			["Buongiorno", "Buona giornata", "Buona sera"],
			["Günaydın", "Iyi günler", "İyi aksamlar"]
		];

		const h = new Date().getHours();
		const timeKey = h < 12 ? 0 : (h < 18 ? 1 : 2);
		const langKey = (Math.floor(Math.random() * lang.length));
		const prefix = lang[langKey][timeKey];

		console.log(prefix + ", you are using the LABOR asset-builder " + version);
	}

	/**
	 * Renders the given error into the console
	 * @param err The error to render
	 * @param title An optional title to render above the error
	 * @param kill The method kills the script by default, you can set this to false to disable that feature
	 */
	public static renderError(err: object | string, title?: string, kill?: boolean): never | void {
		if (isObject(err) && !isUndefined((err as any).stack)) {
			err = (err as any).stack;
		}

		console.error("");
		console.error(Chalk.redBright(title ?? "A FATAL ERROR OCCURRED!\r\nSadly I could not recover :(\r\n"));
		console.error(Chalk.redBright(err));

		if (kill !== false) {
			process.exit(1);
		}
	}
}