/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
const fs = require('fs');
const path = require('path');
module.exports = function(source){
	let dirname = path.dirname(this.resourcePath);
	let baseName = path.basename(this.resourcePath).replace(/\.js$/, '');
	let matcher = new RegExp(baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\.(css|sass|scss|less)$');
	let matcherSource = new RegExp(baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\.(css|sass|scss|less)');
	let addImport = [];
	fs.readdirSync(dirname).forEach(file => {
		if(!file.match(matcher)) return;
		if(source.match(matcherSource)) return;
		addImport.push('import "./'+file+'";');
	});
	if(addImport.length > 0)
		source = addImport.join('\r\n') + '\r\n' + source;
	return source;
};