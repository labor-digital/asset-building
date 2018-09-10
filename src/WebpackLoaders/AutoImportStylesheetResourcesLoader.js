/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const path = require('path');
const fs = require('fs');

let resourceBasePath = null;

function getResourceBasepath(context) {
	if (!resourceBasePath) {
		/**
		 * @type {module.ConfigBuilderContext} context
		 */
		const entry = context.laborConfig.apps[context.currentApp].entry;
		const resourceBasename = path.basename(entry).replace(/\..*?$/, '');
		resourceBasePath = path.resolve(context.dir.current, path.dirname(entry)) + path.sep + resourceBasename;
	}
	return resourceBasePath;
}

module.exports = function AutoImportStylesheetResourcesLoader(source) {

	// Get import extension
	let ext = path.basename(this.resourcePath).replace(/^.*?\./, '');

	// Read resource base name from config context
	const resourceBasePath = getResourceBasepath(this.query.context);
	let resourcePath = resourceBasePath + '.' + ext;

	// Check if file is includable
	if (!fs.existsSync(resourcePath)) {
		// Check if I could look for sass/scss files instead
		if (ext === 'scss' && fs.existsSync(resourceBasePath + '.sass')) resourcePath = resourceBasePath + '.sass';
		else if (ext === 'sass' && fs.existsSync(resourceBasePath + '.scss')) resourcePath = resourceBasePath + '.scss';
		else return;
	}

	// Check if I don't include myself
	const currentRealPath = fs.realpathSync(this.resourcePath);
	resourcePath = fs.realpathSync(resourcePath);
	if (resourcePath === currentRealPath) return source;

	// Add import statement
	let importStatement = '@import "' + path.relative(path.dirname(currentRealPath), resourcePath).replace(/\\/g, '/') + '"';
	if (ext !== 'sass') importStatement += ';';
	importStatement += '\r\n';

	// Add to source
	return importStatement + source;
};