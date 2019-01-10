/**
 * Created by Martin Neundorfer on 19.09.2018.
 * For LABOR.digital
 */
const path = require("path");
const CssLoaderBridge = require("./CssLoaderBridge");

// True if the hack was applied at least once
let isHacked = false;

/**
 /**
 * This wrapper is used to wrap css-loader's internal "processCss", because it parses
 * the css using post-css which is extremely slow and takes up to 4/5th of the compiling time of my test-sass files.
 *
 * The most annoying part is, that the stuff post-css does was already done by our custom-sass-loader.
 * Namely: The extraction of url() assets and @imports.
 *
 * So we have this wrapper which hooks into node's require.cache to be served instead of the real processCss.js
 * and is used to resolve the source which was already prepared by our loader and bridge.
 *
 * If we request a file which was not prepared by our internal loader we simply pass the sources to the default
 * function and let it do what is here for.
 *
 * @param {module.ConfigBuilderContext} context
 */
module.exports = function(context){
	if(isHacked) return;
	isHacked = true;

	// Prepare file list of possible modules to rewrite
	const fileSuffix = path.sep + "lib" + path.sep + "processCss.js";
	const paths = new Set();
	paths.add(context.dir.nodeModules + "css-loader" + fileSuffix);
	paths.add(context.dir.buildingNodeModules + "css-loader" + fileSuffix);
	paths.add(path.dirname(require.resolve("css-loader")) + fileSuffix);
	context.dir.additionalResolverPaths.forEach(path => {
		paths.add(path + fileSuffix);
	});

	// Inject the wrapper to all valid paths
	paths.forEach(file => {
		try {
			const defaultProcessCss = require(file);
			require.cache[file].exports = function cssLoaderProcessCssWrapper (inputSource, inputMap, options, callback) {

				// Check if we have a definition for this file
				let definition = CssLoaderBridge.getDefinitionForStylesheet(options.from);
				if (typeof definition !== "undefined") {
					definition.source = inputSource;
					// Reroute directly to the callback
					callback(null, definition);
					return;
				}

				// Use default processor
				defaultProcessCss(inputSource, inputMap, options, callback);
			};
		} catch (e) {
		}
	});
};


