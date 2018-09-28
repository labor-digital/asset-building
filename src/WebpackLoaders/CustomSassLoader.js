/**
 * Created by Martin Neundorfer on 12.09.2018.
 * For LABOR.digital
 */
const sass = require("node-sass");
const path = require("path");
const ResourceRepository = require("../Helpers/ResourceRepository");
const sassPreParser = require("../Helpers/sassPreParser");
const fs = require("fs");

const resolvedUrlCache = new Map();

module.exports = function customSassLoader(sassSource) {

	const stylesheetPath = this.resourcePath;
	const app = this.query.app;
	const entry = path.resolve(this.query.dir.current, app.entry);
	const urlRelativeRoot = path.dirname(stylesheetPath);
	const self = this;
	const callback = this.async();

	// Check if source is empty
	if (sassSource.trim().length === 0) {
		// Skip the whole ordeal
		callback("");
		return;
	}

	// True if we should use the internal css loader bridge to speed up css compiling
	const useCssLoaderBridge = this.query.useCssLoaderBridge;
	let cssLoaderBridgeUrls = [];
	let urlCounter = 0;

	new Promise((resolve, reject) => {

		// Preparse stylesheet
		const stylesheet = sassPreParser(stylesheetPath, this.query.dir.nodeModules);

		// Add resources to stylesheet
		const resourcePath = ResourceRepository.getResourcePathForStylesheet(entry, stylesheetPath);
		ResourceRepository.addResourcesToStylesheet(resourcePath, stylesheet, () => {
			return sassPreParser(resourcePath, this.query.dir.nodeModules);
		});

		// Register dependencies
		stylesheet.files.forEach(self.addDependency);

		// Get the entry point
		const entrySass = stylesheet.contents.get(stylesheet.main);

		// Holds the tree of files to resolve urls relative
		const compilerPath = [];

		// Stores all imported files to deduplicate the input
		const importedFiles = new Set();

		try {

			function makeReplacementFor(cacheKey) {
				if (useCssLoaderBridge) {
					let url = resolvedUrlCache.get(cacheKey).getValue().replace(/^"|"$/g, "");
					if (url.match(/^[\w\d]/)) url = "./" + url;
					cssLoaderBridgeUrls.push({"url": url});
					return new sass.types.String("___CSS_LOADER_BRIDGE_URL___" + urlCounter++ + "___");
				}
				return resolvedUrlCache.get(cacheKey);
			}

			let result = sass.renderSync({
				"data": entrySass,
				"sourceComments": true,
				"outputStyle": "expanded",
				"importer": function customSassLoaderFileImporter(url, prev) {
					if (importedFiles.has(url)) return {"contents": ""};
					importedFiles.add(url);
					if (stylesheet.contents.has(url)) return {"contents": stylesheet.contents.get(url)};
					return new Error("The SASS compiler, trying to build: \"" + stylesheetPath + "\" required a file: \"" +
						url + "\" from \"" + prev + "\", which was not resolved by the preparser!");
				},
				"functions": {
					"custom-sass-loader-open-file($file)": function customSassLoaderOpenFile(file) {
						compilerPath.push(file.getValue());
						return sass.types.Null.NULL;
					},
					"custom-sass-loader-close-file()": function customSassLoaderCloseFile() {
						compilerPath.pop();
						return sass.types.Null.NULL;
					},
					"custom-sass-loader-url-resolver($url: \"\")": function customSassLoaderUrlResolver(url) {
						url = url.getValue();
						const cacheKey = compilerPath[compilerPath.length - 1] + "-" + url;
						if (resolvedUrlCache.has(cacheKey)) return makeReplacementFor(cacheKey);

						// Check if this is a data url
						if (url.trim().indexOf("data:") === 0) {
							return url;
						}

						// Check if this is a url
						if (url.trim().match(/^https?:/)) {
							return url;
						}

						// Handle query string
						const queryString = url.indexOf("?") === -1 && url.indexOf("#") === -1 ? "" : url.replace(/[^?#]*/, "");
						if (queryString !== "") url = url.replace(/[?#].*$/, "");


						// Check if the url is already readable
						if (fs.existsSync(url)) {
							resolvedUrlCache.set(cacheKey, new sass.types.String("\"" + url + queryString + "\""));
							return makeReplacementFor(cacheKey);
						}

						// Try to resolve the file by walking trough the compiler path
						for (const file of compilerPath) {
							let resolvedPath = path.resolve(path.dirname(file), url);
							if (fs.existsSync(resolvedPath)) {
								resolvedPath = path.relative(urlRelativeRoot, resolvedPath).replace(/\\/g, "/");
								resolvedUrlCache.set(cacheKey, sass.types.String("\"" + resolvedPath + queryString + "\""));
								return makeReplacementFor(cacheKey);
							}
						}

						// Nope
						throw new Error("Could not resolve the url: \"" + url + "\" in \"" + compilerPath[compilerPath.length - 1] + "\"!");
					}
				}
			});
			resolve(result);
		} catch (e) {

			let debug = path.dirname(stylesheetPath) + path.sep + ".debug.scss";
			let dbg = [];
			stylesheet.contents.forEach((v, k) => {
				dbg.push("// FILE: " + k);
				dbg.push(v);
			});
			fs.writeFileSync(debug, dbg.join("\r\n"));

			e.message = "(Writing debug file at " + debug + ") " + e.message;

			reject(e);
		}
	})
		.then((result) => {

			// Store contents to bridge if required
			if (useCssLoaderBridge) {
				const bridge = require("../Helpers/CssLoaderBridge");
				bridge.setDefinitionForStylesheet(stylesheetPath, result.css.toString(), cssLoaderBridgeUrls);

				// Empty string -> Save overhead
				callback(null, "#foo");
				return;
			}

			// Resolve ajax request
			callback(null, result.css.toString());

		})
		.catch(err => {
			err.hideStack = true;
			if (err.file) {
				if (err.file === "stdin") err.file = stylesheetPath;
				else err.file = path.normalize(err.file);
				err.message = err.message.replace(/\s*Current dir:\s*/, "") +
					"      in " + err.file + " (line " + err.line + ", column " + err.column + ")";
			}
			callback(err);
		});
};