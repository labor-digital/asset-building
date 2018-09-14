/**
 * Created by Martin Neundorfer on 14.09.2018.
 * For LABOR.digital
 */
const chokidar = require('chokidar');
const componentImportCache = new Map();
const path = require('path');
const ComponentHelpers = require('../Helpers/ComponentHelpers');
const FileHelpers = require('../Helpers/FileHelpers');

const watchers = new Set();

function registerComponentDirectoryWatcher(result){
	if(watchers.has(result.notifyFile)) return;
	watchers.add(result.notifyFile);
	const watcher = chokidar.watch(result.watchDirectory, {
		'atomic': true,
		'ignoreInitial': true
	});
	watcher.on('all', (e) => {
		if(['add', 'unlink'].indexOf(e) === -1) return;
		componentImportCache.delete(result.filename);
		FileHelpers.touch(result.notifyFile);
	});
}

module.exports = class ComponentRepository {
	static getImportsForFile(filename) {
		filename = path.resolve(filename);
		if (componentImportCache.has(filename)) return componentImportCache.get(filename);

		// Get the list of all import files and their types
		const rawImports = ComponentHelpers.resolveComponentRelationsForFilename(filename);

		// Create the mergefile basename for the internal cache
		const mergeFileBasename = ComponentHelpers.getMergeFileBasename(filename);

		// Create a list of all imports to use for this filename
		const imports = [];

		// Create a list of all files to watch for this filename
		const dependencies = new Set();

		// Create merge files if required
		for (const ext of rawImports.keys()) {
			if (rawImports.get(ext).size > 0) {
				let mergeFilePath = ComponentHelpers.createMergeFile(mergeFileBasename + ext, rawImports.get(ext), ext);
				imports.push(mergeFilePath);

				// Add all files to the dependency files
				dependencies.add(mergeFilePath);
				rawImports.get(ext).forEach(file => dependencies.add(file));
			}
		}

		// Prepare result
		const outerMergeFileName = ComponentHelpers.createOuterMergeFile(mergeFileBasename, imports);
		dependencies.add(outerMergeFileName);
		const outerMergeFileImport = ComponentHelpers.writeJsImportClause(path.relative(path.dirname(filename), outerMergeFileName));
		const result = {
			'filename': filename,
			'watchDirectory': path.dirname(filename),
			'notifyFile': outerMergeFileName,
			'import': outerMergeFileImport,
			'dependencies': dependencies
		};

		// Register watcher
		registerComponentDirectoryWatcher(result);

		// Store to cache
		componentImportCache.set(filename, result);

		// Done
		return result;
	}
};