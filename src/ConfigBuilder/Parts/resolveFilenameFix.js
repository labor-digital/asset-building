/**
 * Created by Martin Neundorfer on 19.09.2018.
 * For LABOR.digital
 */
const path = require('path');
const Module = require('module');

/**
 * We need this fix, because we are a special kind of noodle...
 * My plan was to encapsulate as much node dependencies into the asset-building package as possible,
 * so we can stay up to date easily... The problem is, that all dependencies will be installed
 * inside node_modules directory of @labor/asset-building instead of the project's node_module directory.
 *
 * With that in mind, the REAL problem is, that eslint will ONLY look into the project's
 * node_module directory and not into our internal directory when it looks up plugins / parsers.
 *
 * To fix the resulting problems we supply this fix which helps Module._resolveFilename to look in other
 * directories when it resolves files.
 *
 * @param {module.Dir} dir
 */
module.exports = function resolveFilenameFix(dir){
	// Make sure we can supply modules from our build context
	const resolveFilenameOrig = Module._resolveFilename;
	const additionalPaths = [
		dir.nodeModules.substr(0, dir.nodeModules.length - 1),
		dir.buildingNodeModules.substr(0, dir.buildingNodeModules.length - 1),
		dir.current.substr(0, dir.current.length - 1),
	];

	const resolverCache = {};
	Module._resolveFilename = function resolveFilenameOverride(request, parent, isMain, options) {
		// Prepare cache key to make sure to prevent caching overlay's
		const cacheKey = request + parent.id + isMain;
		const isCacheable = typeof options === 'undefined' || options === null;

		// Make sure to only serve from cache if we don't get options
		if (isCacheable && typeof resolverCache[cacheKey] !== 'undefined') return resolverCache[cacheKey];

		// Prepare local storage to check if we succeeded
		let result = null;

		try {
			// Try default approach
			result = resolveFilenameOrig(request, parent, isMain, options);
		} catch (e) {
			// Try additional path's to resolve the request filename
			if (typeof options !== 'object') options = {};
			options.paths = [path.dirname(parent.filename)].concat(additionalPaths);
			result = resolveFilenameOrig(request, parent, isMain, options);
		}

		// Check if we could resolve the filename
		if (result === null) {
			throw new Error('Could not resolve module request: "' + request +
				'", tried: "' + [path.dirname(request), path.dirname(parent.filename)]
					.concat(additionalPaths).join('", "') + '"');
		}

		// Store output or skip if the value is not cacheable
		if (!isCacheable) return result;
		return resolverCache[cacheKey] = result;
	};
};