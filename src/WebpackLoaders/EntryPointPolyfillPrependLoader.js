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
