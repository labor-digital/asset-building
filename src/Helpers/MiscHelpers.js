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
 * Last modified: 2018.12.14 at 17:48
 */

/**
 * Created by Martin Neundorfer on 14.10.2018.
 * For LABOR.digital
 */
const crypto = require("crypto");
const chalk = require("chalk");

module.exports = class MiscHelpers {
	/**
	 * Helper to kill the script and pretty print the reason of death
	 * @param {string} message
	 * @param {boolean} [isError] If false the "fatal error" header will be omitted
	 */
	static kill(message, isError) {
		console.error("");
		if (isError !== false) console.error(chalk.redBright("A FATAL ERROR OCCURED!\r\nSadly I could not recover :(\r\n"));
		console.error(chalk.redBright(message));
		console.error("");
		process.exit();
	};

	/**
	 * Silly helper to render a multilingual intro text including our current version
	 * @param version
	 */
	static fancyIntro(version) {
		const lang = [
			["Guten Morgen", "Guten Tag", "Guten Abend"],
			["Good morning", "Good day", "Good evening"],
			["Buenos días", "Buenos días", "Buenas noches"],
			["Bonjour", "Bonne journée", "Bonsoir"],
			["Godmorgen", "God dag", "God aften"],
			["Dobro jutro", "Dobar dan", "Dobra večer"],
			["Maidin mhaith", "Dea-lá", "Dea-oíche"],
			["Buongiorno", "Buona giornata", "Buona sera"],
			["Günaydın", "Iyi günler", "İyi aksamlar"],
		];
		const h = new Date().getHours();
		const timeKey = h < 12 ? 0 : (h < 18 ? 1 : 2);
		const langKey = (Math.floor(Math.random() * lang.length));
		const prefix = lang[langKey][timeKey];
		console.log(prefix + ", you are using the LABOR Asset-Builder " + version);
	}

	/**
	 * Converts the given value into an md5 hash
	 * @param {string} value
	 * return {string}
	 */
	static md5(value){
		return crypto.createHash("md5").update(value).digest("hex");
	}

	/**
	 * Makes sure the given string is escaped for the use in regular expressions
	 * @param {string} string
	 * @return {string}
	 */
	static escapeRegex(string){
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	/**
	 * Helper which draws a line for "design" purposes
	 * @param {string} [char]
	 * @return {string}
	 */
	static drawLine(char){
		char = typeof char === "string" ? char : "=";
		return char.repeat(90);
	}
};