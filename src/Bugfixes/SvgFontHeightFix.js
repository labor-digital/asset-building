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
 * Last modified: 2019.02.18 at 22:18
 */

/**
 * This is a hack to make sure the svg image loader always receives a height argument for the svg's
 * even if the "height" attribute is not explicitly set
 * @see https://github.com/jantimon/iconfont-webpack-plugin/issues/32
 */
module.exports = function SvgFontHeightFix() {
	const request = "iconfont-webpack-plugin/lib/icons-to-woff";
	const filename = require.resolve(request);
	const iconsToWoff = require(request);
	require.cache[filename].exports = function(fs, icons, options) {
		iconsToWoff.bind(this);
		return iconsToWoff({
			readFile(filename, callback){
				fs.readFile(filename, (err, source) => {
					source = source.toString();

					// Check if the iconfont webpack plugin would fail for this svg
					const parseSvg = /<svg[^>]+height\s*=\s*["']?(\d+)\s*(pt|px|)["']?/i.exec(source);
					if(!parseSvg){
						// Check if we can read the viewbox to extract the height
						const viewbox = /<svg[^>]+viewBox\s*=\s*["']?\s?([\d.]{1,5}\s[\d.]{1,5}\s[\d.]{1,5}\s[\d.]{1,5})\s?["']?/i.exec(source);
						let height = 100;
						if(viewbox !== null && typeof viewbox[1] === "string"){
							const viewBoxParts = viewbox[1].split(/\s+/).filter(v => v !== "");
							if(typeof viewBoxParts[3] === "string") height = viewBoxParts[3];
						}
						source = source.replace(/^(<svg\s)/i, "$1height=\"" + height + "px\" ");

						// Check if we need a width as well
						const parseSvgWidth = /<svg[^>]+width\s*=\s*["']?(\d+)\s*(pt|px|)["']?/i.exec(source);
						let width = 100;
						if(!parseSvgWidth){
							if(viewbox !== null && typeof viewbox[1] === "string"){
								const viewBoxParts = viewbox[1].split(/\s+/).filter(v => v !== "");
								if(typeof viewBoxParts[2] === "string") width = viewBoxParts[2];
							}
							source = source.replace(/^(<svg\s)/i, "$1width=\"" + width + "px\" ");
						}
					}
					callback(null, {toString: () => source});
				});
			}
		}, icons, options)
	};
};
