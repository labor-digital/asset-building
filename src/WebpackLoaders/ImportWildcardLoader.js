/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const path = require('path');
const glob = require('glob');
module.exports = function(source) {
	const dirname = path.dirname(this.resourcePath);
	const matcher = new RegExp('^\s*import\\s+(["\'])(.*?\\*.*?)\\1', 'mg');
	source = source.replace(matcher, function(a, b, importPath){
		importPath = path.resolve(dirname, importPath).replace(/[\\\/]\*[\\\/]/g, path.sep + '**' + path.sep);
		const result = [];
		for(let realImportPath of glob.sync(importPath)){
			result.push('import "./' + path.relative(dirname, realImportPath).replace(/\\/g, '/') + '";');
		}
		if(result.length === 0) return '';
		return result.join('\r\n');
	});
	return source;

};