/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
/**
 * This plugin is currently required because of a strange bug, which occures if:
 * - Dynamic imports are used
 * - We use the "webpack.optimize.MinChunkSizePlugin" plugin
 * - The output will all be bundled into a single chunk
 *
 * The result is "Uncaught TypeError: undefined is not a function at Array.map (<anonymous>)
 * at webpackAsyncContext (.*\.js$ namespace object:30)..."
 *
 * This is because __webpack_require__.e is not defined in that case.
 * This plugin provides a tiny polyfill to make sure the script runs correctly...
 * @type {module.WebpackFixBrokenChunkPlugin}
 */
module.exports = class WebpackFixBrokenChunkPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap("WebpackFixBrokenChunkPlugin", compilation => {
			compilation.mainTemplate.hooks.requireExtensions.tap("WebpackFixBrokenChunkPlugin", function (_, chunk, hash, chunkIdVar) {
				_ += '\r\n// Fix dynamic code import breakage\r\nif(typeof __webpack_require__.e !== \'function\') __webpack_require__.e = function(e){return Promise.resolve(e);};\r\n'
				return _;
			});
		});
	}
};