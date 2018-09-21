/**
 * Created by Martin Neundorfer on 14.09.2018.
 * For LABOR.digital
 */
const chokidar = require('chokidar');
const path = require('path');
const ComponentHelpers = require('../Helpers/ComponentHelpers');
const FileHelpers = require('../Helpers/FileHelpers');

// The list of files that should be notified by our watcher
const watchers = new Set();

// The list of known component sets
const componentSetStorage = new Map();

// The list of all requirements of specific components (stylesheet rewrite)
const componentRequirements = new Map();

class ComponentRepository {

	static isComponentAndRequiresRewrite(filename) {
		return componentRequirements.has(FileHelpers.unifyFilename(filename));
	}

	static getComponentRequirements(filename) {
		return componentRequirements.get(FileHelpers.unifyFilename(filename));
	}

	/**
	 *
	 * @param {string} filename
	 * @param {string|undefined} modifiers
	 * @return {*}
	 */
	static getDefinitionFor(filename, modifiers) {

		// Parse modifiers
		modifiers = ComponentHelpers.parseModifiers(modifiers);

		// Try to load from cache
		filename = FileHelpers.unifyFilename(filename);
		const cacheKey = path.dirname(filename) + '-' + modifiers.get('raw');
		if (componentSetStorage.has(cacheKey)) return componentSetStorage.get(cacheKey);

		// Resolve entrypoints for the current filename based on the given modifiers
		const entryPoints = ComponentHelpers.resolveComponentEntryPointsForFilename(filename, modifiers);

		// Convert the entrypoints into components by their extension
		const [componentsByExtension, jsFilesToRewrite] = ComponentHelpers.convertEntryPointsIntoComponents(entryPoints);

		// Create the mergefile basename for the internal cache
		const mergeFileBasename = ComponentHelpers.getMergeFileBasename(filename);

		// Create a list of all imports to use for this filename
		const imports = [];

		// Create a list of all files to watch for this filename
		const dependencies = new Set();

		// Create merge files if required
		for (const ext of componentsByExtension.keys()) {
			const components = componentsByExtension.get(ext);
			if (components.size > 0) {
				let mergeFilePath = ComponentHelpers.createMergeFile(mergeFileBasename + ext, components, ext);
				imports.push(mergeFilePath);

				// Add all files to the dependency files
				dependencies.add(mergeFilePath);
				components.forEach(file => dependencies.add(file));
			}
		}

		// Prepare result
		const outerMergeFileName = ComponentHelpers.createOuterMergeFile(mergeFileBasename, imports);
		dependencies.add(outerMergeFileName);
		const outerMergeFileImport = ComponentHelpers.writeJsImportClause(path.relative(path.dirname(filename), outerMergeFileName));
		const setDefinition = {
			'cacheKey': cacheKey,
			'watchDirectory': path.dirname(filename),
			'notifyFile': outerMergeFileName,
			'import': outerMergeFileImport,
			'dependencies': dependencies,
			'jsFilesToRewrite': jsFilesToRewrite
		};

		// Store to cache
		componentSetStorage.set(cacheKey, setDefinition);

		// Rebuild our local lookup tables
		componentRequirements.clear();
		componentSetStorage.forEach(definition => {

			// Read files to rewrite
			definition.jsFilesToRewrite.forEach((rewrites, filename) => {
				componentRequirements.set(filename, [Array.from(rewrites.keys()), Array.from(rewrites.values())]);
			});

		});

		// Register watcher
		registerComponentDirectoryWatcher(setDefinition);

		// Done
		return setDefinition;
	}
}

function registerComponentDirectoryWatcher(result) {
	if (watchers.has(result.notifyFile)) return;
	watchers.add(result.notifyFile);
	const watcher = chokidar.watch(result.watchDirectory, {
		'atomic': true,
		'ignoreInitial': true
	});
	watcher.on('all', (e, file) => {

		// Ignore if we don't add or delete a file
		if (['add', 'unlink'].indexOf(e) === -1) {
			// Check if one of our rewritten files was changed -> flushes cache as well.
			if(e !== 'change' || !ComponentRepository.isComponentAndRequiresRewrite(file)) return;
		}
		componentSetStorage.delete(result.cacheKey);
		FileHelpers.touch(result.notifyFile);
	});
}

module.exports = ComponentRepository;