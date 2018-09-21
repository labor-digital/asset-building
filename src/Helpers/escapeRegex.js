/**
 * Created by Martin Neundorfer on 20.09.2018.
 * For LABOR.digital
 */
module.exports = function escapeRegex(string){
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};