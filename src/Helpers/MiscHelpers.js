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