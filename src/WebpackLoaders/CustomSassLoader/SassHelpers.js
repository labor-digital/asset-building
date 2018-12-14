/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */
const path = require("path");
const FileService = require("../../Services/FileService");
const FileHelpers = require('../../Helpers/FileHelpers');
const Stylesheet = require('./Stylesheet');

const importFilenameCache = new Map();
let guid = 0;

module.exports = class SassHelpers {

	/**
	 * Resolves the path of a imported asset file relative to the parent file
	 * @param importStatement
	 * @param nodeDirectory
	 * @param parentFile
	 * @return {*}
	 */
	static resolveImportFilename(importStatement, nodeDirectory, parentFile) {
		// Try to serve from cache
		const cacheKey = importStatement + nodeDirectory + parentFile;
		if (importFilenameCache.has(cacheKey)) return importFilenameCache.get(cacheKey);
		let output = importStatement;

		// Resolve node modules
		if (output.charAt(0) === "~") {
			output = output.replace(/^[~\\\/]+/, "");
			output = path.resolve(nodeDirectory, output);
		}

		// Resolve relative paths
		const parentDirectory = path.dirname(parentFile) + path.sep;
		if (output.charAt(0) === "." || !output.match(/[\\\/]/)) {
			output = path.resolve(parentDirectory, output);
		}

		// Check if this was enough to find the file
		if (FileService.fileExists(output)) return output;

		// Try to resolve possible sass pathes
		const statementBasename = path.basename(output).replace(/^_+/, "").replace(/\..*?$/, "");
		const statementDirname = path.dirname(output);
		const statementRealPath = path.resolve(parentDirectory, statementDirname) + path.sep;
		const parentExt = parentFile.replace(/^.*?\./, "").toLowerCase();
		const possiblePaths = new Set();
		possiblePaths
			.add(statementRealPath + statementBasename + "." + parentExt)
			.add(statementRealPath + "_" + statementBasename + "." + parentExt)
			.add(statementRealPath + statementBasename + ".sass")
			.add(statementRealPath + "_" + statementBasename + ".sass")
			.add(statementRealPath + statementBasename + ".scss")
			.add(statementRealPath + "_" + statementBasename + ".scss");

		for (const possiblePath of possiblePaths) {
			if (FileService.fileExists(possiblePath)) {
				importFilenameCache.set(cacheKey, possiblePath);
				return possiblePath;
			}
		}

		// Invalid statement
		throw new Error("Could not resolve SASS import: \"" + importStatement + "\" in file: \"" + parentFile + "\"!");
	}

	/**
	 * Is used to prepare a given sass file by traversing it's imports to create a callback
	 * to our sass loader to follow the relative path of the file
	 * @param stylesheetPath
	 * @param nodeDirectory
	 * @return {module.Stylesheet|*}
	 */
	static preParseSass(stylesheetPath, nodeDirectory){
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
			if (ext === 'sass') content = SassHelpers.sass2scss(content);

			// Resolve imports
			content = content.replace(/((?:^|^(?:[^\S\n]+))@import\s+["'])([^"']*?)(["'];?(?:[^\S\n]+)?)/gm, (a, before, importStatement, after) => {
				const importFilename = SassHelpers.resolveImportFilename(importStatement, nodeDirectory, filename);
				const posixImportFilename = FileHelpers.filenameToPosix(importFilename);

				// Check if the import already happened
				if (resolvedFiles.has(importFilename)) return '';

				// Mark file as resolved
				resolvedFiles.add(importFilename);

				// Load child content and parse it
				let childContent = FileService.getFileContent(importFilename);
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
		const sassContent = FileService.getFileContent(stylesheetPath);
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
	}

	/**
	 * Because node-sass has problems when it comes to the two different sass syntaxes
	 * we traverse any .sass file and convert it into .scss syntax
	 * @param content
	 * @return {*}
	 */
	static sass2scss(content){
		if (typeof content !== "string") return content;

		let lines = content.split(/\r?\n/g);

		// Add finisher line
		lines.push("#");

		// The last indend length to check for new blocks
		let lastIndent = 0;

		// Is used to store the last, real indent when iterating over a block comment
		let lastIndentBeforeBlockComment = 0;

		// The previous indents to check how many blocks were closed
		let indentHistory = [];

		// True if currently looping over a block comment
		let inBlockComment = false;

		// The last line index that was not a comment or empty
		let lastLineWithContent = 0;

		// The list of all parsed lines
		const parsedLines = [];

		// Loop over lines
		for (let rawLine of lines) {
			const indent = rawLine.replace(/^(\s*)(.*?)$/g, "$1").length;

			// Check if we are inside a block comment
			if (inBlockComment) {
				if (indent <= lastIndent) {
					// Closing block comment!
					inBlockComment = false;
					lastIndent = lastIndentBeforeBlockComment;
				} else {
					// Loop comments around the logic
					parsedLines.push({"text": "//" + rawLine, "comment": "", "indent": indent, "empty": true});
					continue;
				}
			}

			// Try to parse out inline comments
			let commentIndex = rawLine.indexOf(" //");
			if (commentIndex === -1 && rawLine.charAt(1) === "/") commentIndex = 0;
			let line = rawLine;
			let comment = "";
			if (commentIndex !== -1) {
				comment = line.slice(commentIndex);
				line = line.slice(0, commentIndex);
			}
			line = {"text": line, "comment": comment, "indent": indent};

			// Check if line is empty
			if (line.text.trim().length === 0) {
				line.empty = true;
				parsedLines.push(line);
				continue;
			}

			// Check if we are starting a block comment
			if (line.text.match(/(?:^|\s)\/\*/)) {
				inBlockComment = true;
				line.empty = true;
				line.text = "//" + line.text;
				parsedLines.push(line);
				lastIndentBeforeBlockComment = lastIndent;
				lastIndent = indent;
				continue;
			}

			// Check if we are deeper than before
			if (indent > lastIndent) {
				if (indentHistory.indexOf(indent) === -1)
					indentHistory.push(indent);
				// Update last line
				parsedLines[lastLineWithContent].text += "{";
			}

			// Check if we are higher than before
			else if (lastIndent > indent) {
				let layers = 0;
				for (let i = indentHistory.length - 1; i >= 0; i--) {
					const knownIndent = indentHistory[i];
					if (knownIndent > indent) {
						layers++;
						continue;
					}
					break;
				}

				// Try to fix empty selectors on the previous line
				let skip = false;
				if (parsedLines[lastLineWithContent].text.match(/^\s*[^@+:,{()\n]*?$/g)) {
					if (parsedLines[lastLineWithContent].text.trim() !== "" &&
						!parsedLines[lastLineWithContent].text.match(/^\/\//)) {
						parsedLines[lastLineWithContent].text += "{}";
						skip = true;
					}
				}

				indentHistory = indentHistory.slice(0, indentHistory.length - layers);
				parsedLines[lastLineWithContent].text += "}".repeat(layers);
			}

			lastIndent = indent;

			parsedLines.push(line);
			lastLineWithContent = parsedLines.length - 1;
		}

		// Drop finisher line
		parsedLines.pop();

		// Rebuild parsed lines into a list of scss lines
		lines = [];
		for (const [index, line] of parsedLines.entries()) {
			if (line.empty !== true) {
				// Try to find empty selectors which may break the process
				if (line.text.indexOf(":") === -1 && line.text.match(/^\s*[^:+=@\n{}]*?[^\n{,]$/)) {
					line.text += "{}";
				}

				// Add semicolon to line if required
				if (line.text.match(/[^,{](?:\s)?$/)) {
					line.text += ";";
				}
			}

			lines.push(line.text + " " + line.comment);
		}

		let output = lines.join("\r\n");

		// Replace mixin definitions
		output = output.replace(/(^\s*)([+=])(\s*)/gm, (a, before, char, after) => {
			return before + (char === "+" ? "@include " : "@mixin ") + after;
		});

		// Remove all semicolons in front of an "else"
		output = output.replace(/(});+([^;]*?@else)/gm, "$1$2");

		// Done
		return output;
	}
};

