/**
 * Created by Martin Neundorfer on 10.08.2018.
 * For LABOR.digital
 */
module.exports = function () {
	this.getModes = function (modes) {
		return modes.concat(['test']);
	}
};