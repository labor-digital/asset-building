/**
 * Created by Martin Neundorfer on 12.09.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const sass = require("node-sass");
const SassHelpers = require("./SassHelpers");
const ResourceService = require("./ResourceService");
const FileService = require("../../Services/FileService");
const FileHelpers = require("../../Helpers/FileHelpers");
const PostCssSubComponent = require("../../Components/SubComponents/Postcss");

const resolvedUrlCache = new Map();

module.exports = function customSassLoader(sassSource) {

	let stylesheetPath = FileHelpers.stripOffQuery(this.resource);
	/**
	 * @type {module.ConfigBuilderContext} context
	 */
	const context = this.query.context;
	const app = this.query.currentAppConfig;
	const entry = path.resolve(context.dir.current, app.entry);
	const urlRelativeRoot = path.dirname(stylesheetPath);
	const self = this;
	const callback = this.async();

	// Make sure the extension is ok for us
	const validExtensions = ["css", "sass", "scss"];
	let ext = FileHelpers.getFileExtension(stylesheetPath);
	if(validExtensions.indexOf(ext) === -1){
		// This is not a valid file extension, try to rewrite the stylesheet path
		let alternativeExt = context.callPluginMethod("customSassLoaderFileExtensionFallback", [ext, stylesheetPath, this.resourceQuery, sassSource, context]);
		if(alternativeExt === ext)
			throw new Error("Error while parsing a file called: \"" + stylesheetPath + "\" the file's extension does not look like to be sass compatible!");
		stylesheetPath += "." + alternativeExt;
	}

	// Check if source is empty
	if (sassSource.trim().length === 0) {
		// Skip the whole ordeal
		callback(null, "");
		return;
	}

	// True if we should use the internal css loader bridge to speed up css compiling
	const useCssLoaderBridge = this.query.useCssLoaderBridge;
	let cssLoaderBridgeUrls = [];
	let urlCounter = 0;

	new Promise((resolve, reject) => {

		try {
			// Preparse stylesheet
			const stylesheet = SassHelpers.preParseSass(stylesheetPath, context.dir.nodeModules, sassSource);

			// Add resources to stylesheet
			const resourcePath = ResourceService.getResourcePathForStylesheet(entry, stylesheetPath);
			ResourceService.addResourcesToStylesheet(resourcePath, stylesheet, () => {
				return SassHelpers.preParseSass(resourcePath, context.dir.nodeModules);
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
								return new sass.types.String(url);
							}

							// Check if this is a url
							if (url.trim().match(/^https?:/)) {
								return new sass.types.String(url);
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

				// let debug = path.dirname(stylesheetPath) + path.sep + ".debug.scss";
				// let dbg = [];
				// stylesheet.contents.forEach((v, k) => {
				// 	dbg.push("// FILE: " + k);
				// 	dbg.push(v);
				// });
				// fs.writeFileSync(debug, dbg.join("\r\n"));
				//
				// e.message = "(Writing debug file at " + debug + ") " + e.message;

				reject(e);
			}
		} catch (e) {
			reject(e);
		}
	})
		.then((result) => {
			// Postprocess the css using post-css
			return PostCssSubComponent.applyPostProcessing(result.css.toString(), context);
		})
		.then(result => {
			// Store contents to bridge if required
			if (useCssLoaderBridge) {
				const bridge = require("./CssLoaderBridge");
				bridge.setDefinitionForStylesheet(this.resource, cssLoaderBridgeUrls);

				// Empty string -> Save overhead
				callback(null, result.css);
				return;
			}

			// Resolve ajax request
			callback(null, result.css);

		})
		.catch(err => {
			// Flush all caches to make sure the error can always be resolved by user input
			ResourceService.flush();
			FileService.flush();
			if (useCssLoaderBridge) {
				const bridge = require("./CssLoaderBridge");
				bridge.flush();
			}

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