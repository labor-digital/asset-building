/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
const fs = require('fs');
const path = require('path');
module.exports = function AutoImportRelatedLoader (source){
	const dirname = path.dirname(this.resourcePath);
	const baseName = path.basename(this.resourcePath).replace(/\.js$/, '');
	const baseRegex = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\.(css|sass|scss|less)';
	const matcher = new RegExp(baseRegex + '$');
	const matcherSource = new RegExp(baseRegex);
	const addImport = [];
	fs.readdirSync(dirname).forEach(file => {
		if(!file.match(matcher)) return;
		if(source.match(matcherSource)) return;
		addImport.push('import "./'+file+'";');
	});
	if(addImport.length > 0)
		source = addImport.join('\r\n') + '\r\n' + source;
	return source;
};