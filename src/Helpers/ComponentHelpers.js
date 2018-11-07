/**
 * Created by Martin Neundorfer on 14.09.2018.
 * For LABOR.digital
 */

const path = require('path');
const fs = require('fs');
const FileHelpers = require('./FileHelpers');
const FileRepository = require('./FileRepository');
const crypto = require('crypto');
const escapeRegex = require('./escapeRegex');


// The list of valid keys
const validModifierKeys = ['exclude'];

// The list of keys to be parsed as array
const forceModifierKeysAsArrays = ['exclude'];

const stylesheetExtensions = ['sass', 'scss', 'less', 'css'];
const jsExtensions = ['ts', 'tsx', 'js'];

// The list of extensions which may be used as entry files
const entryPointExtensions = [].concat(jsExtensions).concat(stylesheetExtensions);

// The cache to store parsed modifiers
const modifierCache = new Map();

// Cache to store resolved imports to their real filename
const importFilenameCache = new Map();

let cacheDirectory = null;

module.exports = class ComponentHelpers {

	/**
	 * Parses a list of modifiers into a map
	 * import '@components';
	 * import '@components@ignore:LoaderOverlay,';
	 * import '@components@ignore:LoaderOverlay,@ignore:LoaderOverlay,';
	 *
	 * @param {string} modifiers
	 * @return {Map<string>,<string|undefined|Array>}
	 */
	static parseModifiers (modifiers){

		// Try to serve from cache
		const result = new Map();
		result.set('@raw', modifiers);
		if(typeof modifiers !== 'string') return result;
		if(modifierCache.has(modifiers)) return modifierCache.get(modifiers);

		let modifiersParsed = modifiers.split('@').filter(v => v.trim().length !== 0);
		modifiersParsed.forEach(v => {
			let parts = v.split(':');
			if(typeof parts[1] === 'string'){
				parts[1] = parts[1].trim();
				if(parts[1].indexOf(',') !== -1){
					// Parse lists
					parts[1] = parts[1].split(/,/g).map(v => v.trim());
				}
			}
			// Validate modifier
			if(validModifierKeys.indexOf(parts[0]) === -1){
				throw new Error('Invalid component modifier given: "@' + parts[0] + '"! Allowed are: @' + validModifierKeys.join(', @'));
			}
			// Store modifier
			result.set(parts[0], parts[1]);
		});

		// Force the defined fields to be arrays
		forceModifierKeysAsArrays.forEach(key => {
			if(result.has(key) && !Array.isArray(result.get(key))){
				result.set(key, [result.get(key)]);
			}
		});

		modifierCache.set(modifiers, result);
		return result;
	}

	/**
	 * Resolves all entry points for the current filename.
	 * Possible entrypoint filetypes are defined in the "entryExtensions" constant
	 *
	 * @param {string} filename
	 * @param {Map<string>,<string|undefined|Array>} modifiers
	 * @return {*}
	 */
	static resolveComponentEntryPointsForFilename(filename, modifiers) {
		const directory = path.dirname(filename) + path.sep;
		const result = new Set();
		const excludedComponents = modifiers.has('exclude') ? modifiers.get('exclude') : [];

		// Loop over all current directory's children
		for (const filename of fs.readdirSync(directory)) {
			// Create the real name of the given file
			const realFilename = directory + filename + path.sep;

			// Ignore files on my level
			if (!fs.existsSync(realFilename) || !fs.statSync(realFilename).isDirectory()) continue;

			// Check if this file is ignored
			if(excludedComponents.indexOf(filename) !== -1) continue;

			// Find entry points inside the sub directory
			const subDirContent = fs.readdirSync(realFilename);
			for (const ext of entryPointExtensions) {
				const entryFile = filename + '.' + ext;
				if (subDirContent.indexOf(entryFile) === -1) continue;
				// Add entry files to our result
				result.add({
					'ext': ext,
					'filename': FileHelpers.unifyFilename(realFilename + entryFile)
				});
				break;
			}

		}

		// Done
		return result;
	}

	static convertEntryPointsIntoComponents(entryPoints){

		const componentsByExtension = new Map();
		// We merge typescript and similar stuff as "js" because we don't care how they are handled.
		['js'].concat(stylesheetExtensions).forEach(ext => componentsByExtension.set(ext, new Set()));
		const jsFilesToRewrite = new Map();

		entryPoints.forEach(entryPoint => {
			// Handle stylesheet
			if(stylesheetExtensions.indexOf(entryPoint.ext) !== -1){
				componentsByExtension.get(entryPoint.ext).add(entryPoint.filename);
				return;
			}

			// Handle js entry point
			if(jsExtensions.indexOf(entryPoint.ext) !== -1){

				// Mark as js component
				componentsByExtension.get('js').add(entryPoint.filename);

				// Extract stylesheets
				const replacements = ComponentHelpers.extractStylesheetsFromJsFile(
					entryPoint.filename, componentsByExtension);

				// Ignore if there were no imports
				if(replacements.size === 0) return;

				// Add this entry point as file to rewrite
				jsFilesToRewrite.set(entryPoint.filename, replacements);
			}
		});

		// Merge sass and scss
		componentsByExtension.get('scss').forEach(componentsByExtension.get('sass').add);
		componentsByExtension.delete('scss');

		// Filter out empty extensions
		componentsByExtension.forEach((v,k) => {
			if(v.size !== 0) return;
			componentsByExtension.delete(k);
		});

		// Done
		return [componentsByExtension, jsFilesToRewrite];
	}

	static extractStylesheetsFromJsFile(filename, stylesheetsByExtension){
		const content = FileRepository.getFileContent(filename);
		const matcher = '(^|^(?:[^\\S\\n]+))import(?:\\s+)?\\(?(?:\\s+)?["\']([^"\']*?)\\.(' + stylesheetExtensions.join('|') + ')["\'](?:\\s+)?\\)?;?(?:\\s+)?$';
		let replacements = new Map();
		content.replace(new RegExp(matcher, 'gm'), (a, before, file, ext) => {
			const resolvedFilename = ComponentHelpers.resolveJsImportToFilename(file + '.' + ext, filename);
			if(resolvedFilename === null) return;
			stylesheetsByExtension.get(ext).add(resolvedFilename);

			// Convert into regex
			let replacementRegex = escapeRegex(a.replace(/\r?\n?$/, ''));
			replacementRegex = new RegExp('^' + replacementRegex, 'gm');
			replacements.set(replacementRegex, resolvedFilename);
		});
		return replacements;
	}

	static resolveJsImportToFilename(importStatement, parentFile){
		const cacheKey = importStatement + '-' + parentFile;
		if(importFilenameCache.has(cacheKey)) return importFilenameCache.get(cacheKey);
		const directory = path.dirname(parentFile);
		let resolvedPath = null;

		try {
			// Try to resolve relative to the parent file
			resolvedPath = require.resolve(path.resolve(directory, importStatement));
		} catch (e) {
			try {
				// Try to resolve as node module
				resolvedPath = require.resolve(importStatement);
			} catch (e) {
			}
		}

		// Don't let not resolveable files enter the cache
		if(resolvedPath === null) return resolvedPath;

		// Cache resolved file
		importFilenameCache.set(importStatement, FileHelpers.unifyFilename(resolvedPath));

		// Done
		return resolvedPath;
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
		let d = new Date();
		d.setTime(d.getTime() - 60 * 60);
		fs.utimesSync(mergeFile, d, d);
		return mergeFile;
	}

	static createOuterMergeFile(mergeFilename, imports) {
		const cacheDirectory = ComponentHelpers.getCacheDirectory();
		const mergeFile = cacheDirectory + mergeFilename + 'outer.js';
		let content = imports.map(
			v => ComponentHelpers.writeJsImportClause('./' + path.relative(cacheDirectory, v)))
			.join('\r\n');
		fs.writeFileSync(mergeFile, content);
		let d = new Date();
		d.setTime(d.getTime() - 60 * 60);
		fs.utimesSync(mergeFile, d, d);
		return mergeFile;
	}

	static getCacheDirectory() {
		if (cacheDirectory !== null) return cacheDirectory;
		const nodePath = path.resolve(process.cwd(), 'node_modules/.cache/labor-component-loader/') + path.sep;
		FileHelpers.mkdir(nodePath);
		FileHelpers.flushDirectory(nodePath);
		return cacheDirectory = nodePath;
	}

	static writeImportClause(filename, ext) {
		if (ext === 'js')
			return ComponentHelpers.writeJsImportClause(filename);
		else
			return ComponentHelpers.writeStylesheetImportClause(filename);
	}

	static writeJsImportClause(filename) {
		return 'import "' + filename.replace(/[\\\/]/g, '/') + '";';
	}

	static writeStylesheetImportClause(filename) {
		return '@import "' + filename.replace(/[\\\/]/g, '/') + '";';
	}
};