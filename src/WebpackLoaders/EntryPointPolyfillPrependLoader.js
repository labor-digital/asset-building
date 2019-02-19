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
 * Last modified: 2018.12.14 at 17:41
 */

/**
 * Created by Martin Neundorfer on 19.09.2018.
 * For LABOR.digital
 */
module.exports = function entryPointPolyfillPrependLoader(source) {
	if(this.resourcePath !== this.query.entry) return source;

	// Check if there are polyfills to apply
	if(!Array.isArray(this.query.polyfills) || this.query.polyfills.length === 0) return source;

	// Build polyfill list
	let polyfills = [];
	this.query.polyfills.forEach(p => {
		polyfills.push('import "' + p + '";');
	});
	polyfills = polyfills.join('\r\n');
	return `
${polyfills}
${source}
`;
};
