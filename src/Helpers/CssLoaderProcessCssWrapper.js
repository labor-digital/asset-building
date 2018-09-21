/**
 * Created by Martin Neundorfer on 19.09.2018.
 * For LABOR.digital
 */
const path = require('path');
const CssLoaderBridge = require('./CssLoaderBridge');

// Load the default process css to load it into the cache
const file = path.dirname(require.resolve('css-loader')) + path.sep + 'lib' + path.sep + 'processCss.js';
if (typeof require.cache[file] !== 'undefined') throw new Error('We are to loate, css-loader is already set up!');
const defaultProcessCss = require(file);

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
 * @param inputSource
 * @param inputMap
 * @param options
 * @param callback
 * @return {*}
 */
require.cache[file].exports = function cssLoaderProcessCssWrapper(inputSource, inputMap, options, callback) {

	// Check if we have a definition for this file
	let definition = CssLoaderBridge.getDefinitionForStylesheet(options.from);
	if(typeof definition !== 'undefined'){
		// Reroute directly to the callback
		callback(null, definition);
		return;
	}

	// Use default processor
	defaultProcessCss(inputSource, inputMap, options, callback);
};