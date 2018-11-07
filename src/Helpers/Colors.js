/**
 * Created by Martin Neundorfer on 07.11.2018.
 * For LABOR.digital
 */
module.exports = class Colors {
	static red(string){
		return "\x1b[91m" + string + "\x1b[0m";
	}

	static green(string){
		return "\x1b[32m" + string + "\x1b[0m";
	}

	static yellow(string){
		return "\x1b[93m" + string + "\x1b[0m";
	}
};