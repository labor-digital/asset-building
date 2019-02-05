/**
 * Created by Martin Neundorfer on 12.09.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const sass = require("node-sass");
const resolvedUrlCache = new Map();

const SassFileResolverContext = require("./Entities/SassFileResolverContext");
const SassFileResolver = require("./SassFileResolver");

module.exports = function customSassLoader(sassSource) {
	const callback = this.async();

	try {
		// Prepare the compiler context
		const context = new SassFileResolverContext(this.query.context, this);
		const file = SassFileResolver.getFile(this.resourcePath, sassSource, context);

		// Defines the path to use when resolving files
		context.path.push(file.filename);
		const urlRelativeRoot = path.dirname(file.filename);

		const result = sass.renderSync({
			"data": file.content,
			"sourceComments": true,
			"outputStyle": "expanded",
			"importer": function customSassLoaderFileImporter(url) {
				const importFile = SassFileResolver.getFile(url, null, context);
				return {contents: importFile.content};
			},
			"functions": {
				"custom-sass-loader-open-file($file)": function customSassLoaderOpenFile(file) {
					context.path.push(file.getValue());
					return sass.types.Null.NULL;
				},
				"custom-sass-loader-close-file()": function customSassLoaderCloseFile() {
					context.path.pop();
					return sass.types.Null.NULL;
				},
				"custom-sass-loader-url-resolver($url: \"\")": function customSassLoaderUrlResolver(url) {
					url = url.getValue();
					const cacheKey = context.path[context.path.length - 1] + "-" + url;
					if (resolvedUrlCache.has(cacheKey)) return resolvedUrlCache.get(cacheKey);

					// Check if this is a data url
					if (url.trim().indexOf("data:") === 0)
						return new sass.types.String(url);

					// Check if this is a url
					if (url.trim().match(/^https?:/))
						return new sass.types.String(url);

					// Handle query string
					const queryString = url.indexOf("?") === -1 && url.indexOf("#") === -1 ? "" : url.replace(/[^?#]*/, "");
					if (queryString !== "") url = url.replace(/[?#].*$/, "");

					// Check if the url is already readable
					if (fs.existsSync(url)) {
						resolvedUrlCache.set(cacheKey, new sass.types.String("\"" + url + queryString + "\""));
						return resolvedUrlCache.get(cacheKey);
					}

					// Try to resolve the file by walking trough the compiler path
					for (const file of context.path) {
						let resolvedPath = path.resolve(path.dirname(file), url);
						if (fs.existsSync(resolvedPath)) {
							resolvedPath = path.relative(urlRelativeRoot, resolvedPath).replace(/\\/g, "/");
							resolvedUrlCache.set(cacheKey, sass.types.String("\"./" + resolvedPath + queryString + "\""));
							return resolvedUrlCache.get(cacheKey);
						}
					}

					// Nope
					throw new Error("Could not resolve the url: \"" + url + "\" in \"" +
						context.path[context.path.length - 1] + "\"!");
				}
			}
		});

		// For debug purposes
		// let debug = path.dirname(this.resourcePath) + path.sep + ".debug.css";
		// fs.writeFileSync(debug, result.css);

		// Register dependencies for this sass file
		if (typeof result.stats === "object" && Array.isArray(result.stats.includedFiles))
			result.stats.includedFiles.forEach(file => {
				this.addDependency(file.replace(/\//g, path.sep));
			});

		callback(null, result.css, null);
	} catch (e) {
		e.hideStack = true;
		if (e.file) {
			if (e.file === "stdin") e.file = this.resourcePath;
			else e.file = path.normalize(e.file);
			e.message = e.message.replace(/\s*Current dir:\s*/, "") +
				"      in " + e.file + " (line " + e.line + ", column " + e.column + ")";
		}
		callback(e);
	}
};