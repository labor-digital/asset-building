/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */
const path = require('path');
const FileRepository = require('../Helpers/FileRepository');

const importFilenameCache = new Map();

module.exports = class SassHelpers {

	static resolveImportFilename(importStatement, nodeDirectory, parentFile){
		// Try to serve from cache
		const cacheKey = importStatement + nodeDirectory + parentFile;
		if(importFilenameCache.has(cacheKey)) return importFilenameCache.get(cacheKey);
		let output = importStatement;

		// Resolve node modules
		if (output.charAt(0) === '~') {
			output = output.replace(/^[~\\\/]+/, '');
			output = path.resolve(nodeDirectory, output);
		}

		// Resolve relative paths
		const parentDirectory = path.dirname(parentFile) + path.sep;
		if (output.charAt(0) === '.' || !output.match(/[\\\/]/)) {
			output = path.resolve(parentDirectory, output);
		}

		// Check if this was enough to find the file
		if(FileRepository.fileExists(output)) return output;

		// Try to resolve possible sass pathes
		const statementBasename = path.basename(output).replace(/^_+/, '').replace(/\..*?$/, '');
		const statementDirname = path.dirname(output);
		const statementRealPath = path.resolve(parentDirectory, statementDirname) + path.sep;
		const parentExt = parentFile.replace(/^.*?\./, '').toLowerCase();
		const possiblePaths = new Set();
		possiblePaths
			.add(statementRealPath + statementBasename + '.' + parentExt)
			.add(statementRealPath + '_' + statementBasename + '.' + parentExt)
			.add(statementRealPath + statementBasename + '.sass')
			.add(statementRealPath + '_' + statementBasename + '.sass')
			.add(statementRealPath + statementBasename + '.scss')
			.add(statementRealPath + '_' + statementBasename + '.scss');

		for (const possiblePath of possiblePaths) {
			if(FileRepository.fileExists(possiblePath)){
				importFilenameCache.set(cacheKey, possiblePath);
				return possiblePath;
			}
		}

		// Invalid statement
		throw new Error('Could not resolve SASS import: "' + importStatement + '" in file: "' + parentFile + '"!');
	}

};

