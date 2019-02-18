/**
 * Created by Martin Neundorfer on 04.02.2019.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const FileHelpers = require("../../Helpers/FileHelpers");

module.exports = function ResourceLoader(source) {

	// Make this loader async
	const callback = this.async();

	// Ignore empty inputs
	if (source.replace(/[\s\n]+/g, "").trim() === "") {
		callback(null, source);
		return;
	}

	// Prepare file locations
	let stylesheetPath = FileHelpers.unifyFilename(FileHelpers.stripOffQuery(this.resourcePath));
	let rootPath = FileHelpers.unifyFilename(this.query.currentDir + path.dirname(this.query.entry)) + path.sep;
	const possibleResourceLocations = [];

	// Register root resources
	this.query.ext.forEach(ext => {
		const possiblePath = path.resolve(rootPath) + path.sep + "Resources." + ext;
		possibleResourceLocations.push(possiblePath);
	});

	// Check if we have to search upwards for resources in our root path
	if(stylesheetPath.indexOf(rootPath) === -1){
		const rootParts = rootPath.split(path.sep);
		while(rootParts.length > 0){
			rootParts.pop();
			if(stylesheetPath.indexOf(rootParts.join(path.sep) + path.sep) === 0){
				rootPath = rootParts.join(path.sep) + path.sep;
				break;
			}
		}
	}

	// Add resources up to the root directory
	if (stylesheetPath.indexOf(rootPath) === 0) {
		// We can traverse the path down...
		const pathParts = stylesheetPath.replace(rootPath, "").split(path.sep);
		pathParts.unshift(".");
		pathParts.pop();
		let localPath = "";
		pathParts.forEach(part => {
			localPath += part + path.sep;
			this.query.ext.forEach(ext => {
				const possiblePath = path.resolve(rootPath + localPath) + path.sep + "Resources." + ext;
				if(possibleResourceLocations.indexOf(possiblePath) !== -1) return;
				possibleResourceLocations.push(possiblePath);
			});
		});
	}

	// Filter out all non-existing resources
	const existingResourceLocations = possibleResourceLocations.filter((v) => fs.existsSync(v));

	// Skip if there are no resources
	if (existingResourceLocations.length === 0){
		callback(null, source);
		return;
	}
	
	// Make wrapper to import the required files
	const wrapper = [];
	existingResourceLocations.forEach(file => {
		wrapper.push("@import \"" + FileHelpers.unifyFilename(file) + "\";");
	});

	callback(null, wrapper.join("\r\n") + "\r\n" + source);
};