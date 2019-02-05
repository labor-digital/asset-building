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
	const rootPath = FileHelpers.unifyFilename(this.query.currentDir + path.dirname(this.query.entry)) + path.sep;
	const possibleResourceLocations = [];

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
				possibleResourceLocations.push(
					path.resolve(rootPath + localPath) + path.sep + "Resources." + ext);
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