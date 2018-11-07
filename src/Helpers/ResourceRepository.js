/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */
const chokidar = require('chokidar');
const FileRepository = require('./FileRepository');
const FileHelpers = require('./FileHelpers');

const resourceCache = new Map();
/**
 * @type {Map<string, Set<string>>}
 */
const fileToCacheMap = new Map();
const watchers = new Set();

function registerResourceWatcher(filename){
	if(watchers.has(filename)) return;
	watchers.add(filename);
	const watcher = chokidar.watch(filename, {
		'atomic': true,
		'ignoreInitial': true
	});
	watcher.on('all', (e) => {
		if(!fileToCacheMap.has(filename)) return;

		// Resolving all resource sets with this filename
		const setsToFlush = fileToCacheMap.get(filename);

		// Flushing sets
		for(const set of setsToFlush){
			resourceCache.delete(set);
		}

		// Removing all flushed sets
		for(const [file, setsOfFile] of fileToCacheMap){
			for(const set of setsOfFile){
				if(setsToFlush.has(set)) {
					// Flush this file
					setsOfFile.delete(set);
				}
			}
			if(setsOfFile.size === 0) fileToCacheMap.delete(file);
		}
	});
}

/**
 *
 * @param {module.Stylesheet} resources
 * @param {module.Stylesheet} stylesheet
 */
function resourceAndStylesheetMerger (resources, stylesheet){
	// Merge all files into stylesheet
	for(const file of resources.files){
		stylesheet.files.add(file);
	}
	for(const [k, content] of resources.contents){
		stylesheet.contents.set(k, content);
	}

	// Add merge file
	const mergeFile = `
@import "${resources.main}";
@import "${stylesheet.main}";	
`;

	stylesheet.contents.set('__ENTRY__', mergeFile);
	stylesheet.main = '__ENTRY__';
}

module.exports = class ResourceRepository {

	static getResourcePathForStylesheet(entry, stylesheetPath){
		const ext = FileHelpers.getFileExtension(stylesheetPath);
		return FileHelpers.getFileWithoutExtension(entry) + '-resources.' + ext;
	}

	/**
	 * Checks if we have to alter the given stylesheet based on the given resource path
	 * @param {string} resourcePath
	 * @param {module.Stylesheet} stylesheet
	 * @param {function} resourceResolver
	 */
	static addResourcesToStylesheet(resourcePath, stylesheet, resourceResolver){
		// Ignore if there is no resource file
		if(!FileRepository.fileExists(resourcePath)) return;

		// Try to load from cache
		const cacheKey = resourcePath;
		if(!resourceCache.has(cacheKey)){
			// Resolve resources
			const resources = resourceResolver();

			// Register files to watcher
			for(const filename of resources.files){
				registerResourceWatcher(filename);
				// Add to reverse file map
				if(!fileToCacheMap.has(filename))
					fileToCacheMap.set(filename, new Set());
				fileToCacheMap.get(filename).add(cacheKey);
			}

			// Store to cache
			resourceCache.set(cacheKey, resources);
		}

		// Merge both together
		resourceAndStylesheetMerger(resourceCache.get(cacheKey), stylesheet);
	}

	static flush(){
		resourceCache.clear();
		fileToCacheMap.clear();
	}
};