/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");

const storage = new Map();
const watchers = new Set();

function registerFileWatcher(filename) {
	if (watchers.has(filename)) return;
	watchers.add(filename);
	const watcher = chokidar.watch(filename, {
		"atomic": true,
		"ignoreInitial": true
	});
	watcher.on("all", (e) => {
		if (storage.has(filename)) storage.delete(filename);
	});
}

module.exports = class FileService {

	static getFileContent(filename) {
		filename = path.resolve(filename);
		if (storage.has(filename)) return storage.get(filename);
		if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) return null;
		const content = fs.readFileSync(filename, "utf-8");
		storage.set(filename, content);
		registerFileWatcher(filename);
		return content;
	}

	static setFileContent(filename, content){
		filename = path.resolve(filename);
		storage.set(filename, content);
	}

	static fileExists(filename) {
		return this.getFileContent(filename) !== null;
	}

	static getAll() {
		return storage;
	}

	static flush() {
		storage.clear();
	}
};