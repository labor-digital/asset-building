/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
module.exports = function humanFileSize(size) {
	var i = Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};