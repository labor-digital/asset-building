/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */

const path = require('path');
const fs = require('fs');
module.exports = class FileHelpers {

	static getFileExtension(filename) {
		return filename.replace(/^(.*?\.)([^\\\/]*)$/, '$2').toLowerCase();
	}

	static getFileWithoutExtension(filename) {
		const ext = FileHelpers.getFileExtension(filename);
		return filename.replace(new RegExp('\\.' + ext + '$'), '');
	}

	static filenameToPosix(filename) {
		return filename.replace(/\\/g, '/');
	}

	static humanFileSize(size) {
		var i = Math.floor(Math.log(size) / Math.log(1024));
		return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
	}

	/**
	 * @see https://gist.github.com/bpedro/742162#gistcomment-828133
	 * @param {string} directory The directory to create
	 * @return {string}
	 */
	static mkdir(directory) {
		var path = directory.replace(/[\\\/]/g, '/').replace(/\/$/, '').split('/');

		for (var i = 1; i <= path.length; i++) {
			var segment = path.slice(0, i).join('/');
			!fs.existsSync(segment) ? fs.mkdirSync(segment) : null ;
		}
	}

	static touch(filename){
		fs.utimesSync(filename, new Date(), new Date());
	}
};