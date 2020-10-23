/*
 * Copyright 2019 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2018.10.19 at 18:27
 */
import {
	AssetBuilderWebpackPluginInterface,
	AssetBuilderWebpackPluginStaticInterface
} from "./AssetBuilderWebpackPluginInterface";

/**
 * This plugin is currently required because of a strange bug, which occurs if:
 * - Dynamic imports are used
 * - We use the "webpack.optimize.MinChunkSizePlugin" plugin
 * - The output will all be bundled into a single chunk
 *
 * The result is "Uncaught TypeError: undefined is not a function at Array.map (<anonymous>)
 * at webpackAsyncContext (.*\.js$ namespace object:30)..."
 *
 * This is because __webpack_require__.e is not defined in that case.
 * This plugin provides a tiny polyfill to make sure the script runs correctly...
 */
export const WebpackFixBrokenChunkPlugin: AssetBuilderWebpackPluginStaticInterface =
	class implements AssetBuilderWebpackPluginInterface {
		apply(compiler) {
			compiler.hooks.compilation.tap("WebpackFixBrokenChunkPlugin", compilation => {
				compilation.mainTemplate.hooks.requireExtensions.tap("WebpackFixBrokenChunkPlugin", function (_, chunk, hash, chunkIdVar) {
					_ += "\r\n// Fix dynamic code import breakage\r\nif(typeof __webpack_require__.e !== 'function') __webpack_require__.e = function(e){return Promise.resolve(e);};\r\n";
					return _;
				});
			});
		}
	};