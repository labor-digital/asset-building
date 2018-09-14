/**
 * Created by Martin Neundorfer on 12.09.2018.
 * For LABOR.digital
 */
const sass = require('node-sass');
const path = require('path');
const ResourceRepository = require('../Helpers/ResourceRepository');
const FileRepository = require('../Helpers/FileRepository');
const sassPreParser = require('../Helpers/sassPreParser');
const fs = require('fs');

const resolvedUrlCache = new Map();

module.exports = function customSassLoader(sassSource) {
	/**
	 * @type {module.ConfigBuilderContext}
	 */
	const context = this.query.context;
	const stylesheetPath = this.resourcePath;
	const app = context.laborConfig.apps[context.currentApp];
	const entry = path.resolve(context.dir.current, app.entry);
	const urlRelativeRoot = path.dirname(stylesheetPath);
	const self = this;
	const callback = this.async();

	// Check if source is empty
	if(sassSource.trim().length === 0){
		// Skip the whole ordeal
		callback('');
		return;
	}

	new Promise((resolve, reject) => {

		// Preparse stylesheet
		const stylesheet = sassPreParser(stylesheetPath, context.dir.nodeModules);

		// Add resources to stylesheet
		const resourcePath = ResourceRepository.getResourcePathForStylesheet(entry, stylesheetPath);
		ResourceRepository.addResourcesToStylesheet(resourcePath, stylesheet, () => {
			return sassPreParser(resourcePath, context.dir.nodeModules);
		});

		// Get the entry point
		const entrySass = stylesheet.contents.get(stylesheet.main);

		// Holds the tree of files to resolve urls relative
		const compilerPath = [];

		// Stores all imported files to deduplicate the input
		const importedFiles = new Set();

		try {
			let result = sass.renderSync({
				'data': entrySass,
				'sourceComments': true,
				'outputStyle': 'expanded',
				'omitSourceMapUrl': true,
				'sourceMapRoot': process.cwd(),
				'sourceMapContents': true,
				'sourceMap': path.join(process.cwd(), "/sass.map"),
				'importer': function customSassLoaderFileImporter(url, prev) {
					if (importedFiles.has(url)) return {'contents': ''};
					importedFiles.add(url);
					if (stylesheet.contents.has(url)) return {'contents': stylesheet.contents.get(url)};
					return new Error('The SASS compiler, trying to build: "' + stylesheetPath + '" required a file: "' +
						url + '" from "' + prev + '", which was not resolved by the preparser!');
				},
				'functions': {
					'custom-sass-loader-open-file($file)': function customSassLoaderOpenFile(file) {
						compilerPath.push(file.getValue());
						return sass.types.Null.NULL;
					},
					'custom-sass-loader-close-file()': function customSassLoaderCloseFile() {
						return sass.types.Null.NULL;
					},
					'custom-sass-loader-url-resolver($url: "")': function customSassLoaderUrlResolver(url) {
						url = url.getValue();
						const cacheKey = compilerPath[compilerPath.length - 1] + '-' + url;
						if (resolvedUrlCache.has(cacheKey)) return resolvedUrlCache.get(cacheKey);

						// Check if this is a data url
						if (url.trim().indexOf('data:') === 0) {
							return url;
						}

						// Handle query string
						const queryString = url.indexOf('?') === -1 && url.indexOf('#') === -1 ? '' : url.replace(/[^?#]*/, '');
						if (queryString !== '') url = url.replace(/[?#].*$/, '');


						// Check if the url is already readable
						if (fs.existsSync(url)) {
							resolvedUrlCache.set(cacheKey, new sass.types.String('"' + url + queryString + '"'));
							return resolvedUrlCache.get(cacheKey);
						}

						// Try to resolve the file by walking trough the compiler path
						for (const file of compilerPath) {
							let resolvedPath = path.resolve(path.dirname(file), url);
							if (fs.existsSync(resolvedPath)) {
								resolvedPath = path.relative(urlRelativeRoot, resolvedPath).replace(/\\/g, '/');
								resolvedUrlCache.set(cacheKey, sass.types.String('"' + resolvedPath + queryString + '"'));
								return resolvedUrlCache.get(cacheKey);
							}
						}

						// Nope
						throw new Error('Could not resolve the url: "' + url + '" in "' + compilerPath[compilerPath.length - 1] + '"!');
					}
				}
			});
			resolve([result, stylesheet]);
		} catch (e) {

			let debug = path.dirname(stylesheetPath) + path.sep + 'debug.scss';
			let dbg = [];
			stylesheet.contents.forEach((v, k) => {
				dbg.push('// FILE: ' + k);
				dbg.push(v)
			});
			fs.writeFileSync(debug, dbg.join('\r\n'));

			e.message = '(Writing debug file at ' + debug + ') ' + e.message;

			reject(e);
		}
	})
		.then(([result,stylesheet]) => {
			// Handle the source map of the compiled sass
			if (result.map && result.map !== "{}") {
				// Remove all import and open-file statements from the source map -> origin disclosure
				// let map = result.map.toString('utf-8');
				// map = map.replace(/((?:\s+)?(?:@import\s+|custom-sass-loader-open-file\()\\?["'])([^"']*?)(\\?["'];?(?:\s+)?)/gm,
				// 	(a, before, content, after) => {
				// 		return before + 'x'.repeat(content.length) + after;
				// 	});


				// This part is stolen from sass-loader
				// https://github.com/webpack-contrib/sass-loader/blob/master/lib/loader.js#L56
				result.map = JSON.parse(result.map);

				// Make sure to replace our resource loader pseudo wrapper as first map source
				result.map.sourcesContent[0] = sassSource;

				// Revert all the sources we know are real back to their initial content -> Remove our changes
				const knownFileContents = FileRepository.getAll();
				const knownFileBase = process.cwd() + path.sep;
				result.map.sources.forEach((filename, key) => {
					if(typeof filename !== 'string') return;
					filename = knownFileBase + path.normalize(filename);
					if(!knownFileContents.has(filename)){
						return;
					}
					result.map.sourcesContent[key] = knownFileContents.get(key);
				});

				// result.map.file is an optional property that provides the output filename.
				// Since we don't know the final filename in the webpack build chain yet, it makes no sense to have it.
				delete result.map.file;
				// The first source is 'stdin' according to node-sass because we've used the data input.
				// Now let's override that value with the correct relative path.
				// Since we specified options.sourceMap = path.join(process.cwd(), "/sass.map"); in normalizeOptions,
				// we know that this path is relative to process.cwd(). This is how node-sass works.
				result.map.sources[0] = path.relative(process.cwd(), stylesheetPath);
				// node-sass returns POSIX paths, that's why we need to transform them back to native paths.
				// This fixes an error on windows where the source-map module cannot resolve the source maps.
				// @see https://github.com/webpack-contrib/sass-loader/issues/366#issuecomment-279460722
				result.map.sourceRoot = path.normalize(result.map.sourceRoot);
				result.map.sources = result.map.sources.map(path.normalize);
			} else {
				result.map = null;
			}

			// Register dependencies
			stylesheet.files.forEach(self.addDependency);

			// Resolve ajax request
			callback(null, result.css.toString(), result.map);
		})
		.catch(err => {
			err.hideStack = true;
			if (err.file) {
				if (err.file === 'stdin') err.file = stylesheetPath;
				else err.file = path.normalize(err.file);
				err.message = err.message.replace(/\s*Current dir:\s*/, "") +
					"      in " + err.file + " (line " + err.line + ", column " + err.column + ")";
			}
			callback(err);
		});
};