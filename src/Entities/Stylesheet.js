/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */
module.exports = class Stylesheet {
	constructor(filename, main, contents, files){

		/**
		 * The type of which this stylesheet is
		 * @type {string}
		 */
		this.type = filename.replace(/^.*?\./, '').toLowerCase();

		/**
		 * The filename of this stylesheet
		 * @type {string}
		 */
		this.filename = filename;

		/**
		 * The list of all contents by their filename
		 * @type {Map<string, string>}
		 */
		this.contents = contents;

		/**
		 *  The list of all resolved files for this stylesheet
		 * @type {Set<string>}
		 */
		this.files = files;

		/**
		 * The name of the main content in this.contents
		 * @type {string}
		 */
		this.main = main;
	}

};