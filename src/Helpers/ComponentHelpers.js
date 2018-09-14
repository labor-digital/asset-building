/**
 * Created by Martin Neundorfer on 14.09.2018.
 * For LABOR.digital
 */

const path = require('path');
const fs = require('fs');
const FileHelpers = require('./FileHelpers');
const crypto = require('crypto');
const entryExtensions = ['sass', 'scss', 'js'];

function findEntryFiles(entryBasename, fileList) {
	const result = new Map();
	for (const ext of entryExtensions) {
		const entryFile = entryBasename + '.' + ext;
		if (fileList.indexOf(entryFile) === -1) continue;
		result.set(ext, entryFile);
	}
	return result;
}

let cacheDirectory = null;

module.exports = class ComponentHelpers {

	static resolveComponentRelationsForFilename(filename) {
		const directory = path.dirname(filename) + path.sep;

		// Prepare result
		const result = new Map();
		for (const ext of entryExtensions) {
			result.set(ext, new Set());
		}

		// Loop over all current directory's children
		for (const filename of fs.readdirSync(directory)) {

			// Create the real name of the given file
			const realFilename = directory + filename + path.sep;

			// Ignore files on my level
			if (!fs.statSync(realFilename).isDirectory()) continue;

			// Find all files in the sub dir
			const subDirContent = fs.readdirSync(realFilename);
			let entryFiles = findEntryFiles(filename, subDirContent);

			// Check if we can use that
			if (entryFiles.size > 0) {
				// Add entry files to our result
				entryFiles.forEach(function (filename, ext) {
					result.get(ext).add(realFilename + filename);
				});
				continue;
			}

			// Check if this is an underscore directory
			if (filename.charAt(0) === '_') {
				// Parse all contents into the result if there is no distinct entry file
				subDirContent.forEach(function (filename) {
					const ext = FileHelpers.getFileExtension(filename);
					if (entryExtensions.indexOf(ext) === -1) return;
					result.get(ext).add(realFilename + filename);
				});
			}
		}

		// Merge scss into sass
		for (const scss of result.get('scss')) {
			result.get('sass').add(scss);
		}
		result.delete('scss');

		// Done
		return result;
	}

	static getMergeFileBasename(filename) {
		let baseFilename = filename;
		baseFilename = crypto.createHash('md5').update(baseFilename).digest("hex");
		return baseFilename + '.';
	}

	static createMergeFile(mergeFilename, files, ext) {
		const cacheDirectory = ComponentHelpers.getCacheDirectory();
		const mergeFile = cacheDirectory + mergeFilename;
		let content = [];
		for (const importFile of files) {
			content.push(ComponentHelpers.writeImportClause(path.relative(cacheDirectory, importFile), ext));
		}
		content = content.join('\r\n');
		fs.writeFileSync(mergeFile, content);
		return mergeFile;
	}

	static createOuterMergeFile(mergeFilename, imports) {
		const cacheDirectory = ComponentHelpers.getCacheDirectory();
		const mergeFile = cacheDirectory + mergeFilename + 'outer.js';
		let content = imports.map(
			v => ComponentHelpers.writeJsImportClause('./' + path.relative(cacheDirectory, v)))
			.join('\r\n');
		fs.writeFileSync(mergeFile, content);
		return mergeFile;
	}

	static getCacheDirectory() {
		if (cacheDirectory !== null) return cacheDirectory;
		const nodePath = path.resolve(process.cwd(), 'node_modules/.cache/labor-component-loader/') + path.sep;
		FileHelpers.mkdir(nodePath);
		return cacheDirectory = nodePath;
	}

	static writeImportClause(filename, ext) {
		if (ext === 'js')
			return ComponentHelpers.writeJsImportClause(filename);
		else
			return ComponentHelpers.writeSassImportClause(filename);
	}

	static writeJsImportClause(filename) {
		return 'import "' + filename.replace(/[\\\/]/g, '/') + '";';
	}

	static writeSassImportClause(filename) {
		return '@import "' + filename.replace(/[\\\/]/g, '/') + '"';
	}
};