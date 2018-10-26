/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */
const sass2scss = require('../Helpers/sass2scss');
const FileRepository = require('../Helpers/FileRepository');
const FileHelpers = require('../Helpers/FileHelpers');
const SassHelpers = require('../Helpers/SassHelpers');
const Stylesheet = require('../Entities/Stylesheet');

let guid = 0;

module.exports = function sassPreParser(stylesheetPath, nodeDirectory) {
	const resolvedFiles = new Set();
	const fileContents = new Map();
	const posixStylesheetPath = FileHelpers.filenameToPosix(stylesheetPath);

	function makeImportWrapper(filename) {
		const importKey = 'import-wrapper-' + guid++;
		let content = `
$customSassLoaderTmp: custom-sass-loader-open-file("${filename}");
@import "${filename}";
$customSassLoaderTmp: custom-sass-loader-close-file();
`;
		fileContents.set(importKey, content);
		return importKey;
	}

	function parseContent(filename, content) {
		const ext = FileHelpers.getFileExtension(filename);
		const posixFilename = FileHelpers.filenameToPosix(filename);

		if (content === null) throw new Error('Could not read contents of sass file: "' + filename + '"');

		// Make sure that everything looks like scss
		if (ext === 'sass') {
			content = sass2scss(content);
		}

		// Resolve imports
		content = content.replace(/((?:^|^(?:[^\S\n]+))@import\s+["'])([^"']*?)(["'];?(?:[^\S\n]+)?)/gm, (a, before, importStatement, after) => {
			const importFilename = SassHelpers.resolveImportFilename(importStatement, nodeDirectory, filename);
			const posixImportFilename = FileHelpers.filenameToPosix(importFilename);

			// Check if the import already happened
			if (resolvedFiles.has(importFilename)) return '';

			// Mark file as resolved
			resolvedFiles.add(importFilename);

			// Load child content and parse it
			let childContent = FileRepository.getFileContent(importFilename);
			parseContent(importFilename, childContent);

			// Create import wrapper
			return before + makeImportWrapper(posixImportFilename) + after;
		});

		// Wrap url calls to make sure they get resolved propperly
		content = content.replace(/(url(?:\s+)?\()((?:\s+)?["']?[^"']*?["']?(?:[^\S\n]+)?)(\))/gm, (a, before, url, after) => {
			// Ignore data urls
			if (url.indexOf('data: ') !== -1) return a;

			// Make sure to enquote everything that does not look like it is a variable
			if (!url.match(/[$#{}"']/)) url = '"' + url + '"';
			return before + 'custom-sass-loader-url-resolver(' + url + ')' + after;
		});

		// Store the file content
		fileContents.set(posixFilename, content);
	}

	// Load the stylesheet content
	const sassContent = FileRepository.getFileContent(stylesheetPath);
	if (sassContent === null) throw new Error('Invalid stylesheetPath to load: ' + stylesheetPath);

	// Add stylehseet to the watchable files
	resolvedFiles.add(stylesheetPath);

	// Parse contents and extract children
	parseContent(stylesheetPath, sassContent);

	// Create an outer wrapper to make sure url's in the basefile may be resolved as in all other files
	const outerWrapper = '@import "' + makeImportWrapper(posixStylesheetPath) + '";';
	const outerKey = 'main-' + guid++;
	fileContents.set(outerKey, outerWrapper);

	// Done
	return new Stylesheet(stylesheetPath, outerKey, fileContents, resolvedFiles);
};
