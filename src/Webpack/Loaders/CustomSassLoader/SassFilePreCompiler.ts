/*
 * Copyright 2019 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2019.02.20 at 19:04
 */
import {forEach} from "@labor-digital/helferlein/lib/Lists/forEach";
import {isNull} from "@labor-digital/helferlein/lib/Types/isNull";
import fs from "fs";
import path from "path";
import {FileHelpers} from "../../../Helpers/FileHelpers";
import {SassFile} from "./Entities/SassFile";
import {SassFileResolverContext} from "./Entities/SassFileResolverContext";

export class SassFilePreCompiler {
	/**
	 * @param file
	 * @param context
	 */
	static apply(file: SassFile, context: SassFileResolverContext): void {
		// Check if we have to convert sass files to scss
		if (file.extension === "sass")
			file.content = SassFilePreCompiler.sass2scss(file.content);

		// Resolve imports
		file.content = file.content.replace(/((?:^|^(?:[^\S\n]+))@import\s+["'])([^"']*?)(["'];?(?:[^\S\n]+)?)/gm,
			(a, before, importPath) => {
				const importFilename = SassFilePreCompiler.resolveImportFilename(context, importPath, file.filename);
				const posixImportFilename = FileHelpers.filenameToPosix(importFilename);

				// Create wrapper
				return `
$customSassLoaderTmp: custom-sass-loader-open-file("${posixImportFilename}");
@import "${posixImportFilename}";
$customSassLoaderTmp: custom-sass-loader-close-file();
`;
			});

		// Resolve url's
		file.content = file.content.replace(/(url(?:\s+)?\()((?:\s+)?["']?[^"']*?["']?(?:[^\S\n]+)?)(\))/gm,
			(a, before, url, after) => {
				// Ignore data urls
				if (url.indexOf("data: ") !== -1) return a;

				// Make sure to enquote everything that does not look like it is a variable
				if (!url.match(/[$#{}"']/)) url = "\"" + url + "\"";
				return before + "custom-sass-loader-url-resolver(" + url + ", \"" + FileHelpers.filenameToPosix(file.filename) + "\")" + after;
			});
	}

	/**
	 * Resolves the path of a imported asset file relative to the parent file
	 * @param context
	 * @param importPath
	 * @param currentFile
	 * @return {*}
	 */
	static resolveImportFilename(context: SassFileResolverContext, importPath: string, currentFile: string): string {
		let output = importPath;

		// Resolve node modules
		if (output.charAt(0) === "~") {
			output = output.replace(/^[~\\\/]+/, "");
			output = path.resolve(context.parentContext.parentContext.nodeModulesPath, output);
		}

		// Resolve relative paths
		const parentDirectory = path.dirname(currentFile) + path.sep;
		if (output.charAt(0) === "." || !output.match(/[\\\/]/)) {
			output = path.resolve(parentDirectory, output);
		}

		// Check if this was enough to find the file
		if (fs.existsSync(output) && fs.lstatSync(output).isFile()) return output;

		// Try to resolve possible sass paths
		const statementBasename = path.basename(output).replace(/^_+/, "").replace(/\..*?$/, "");
		const statementDirname = path.dirname(output);
		const statementRealPath = path.resolve(parentDirectory, statementDirname) + path.sep;
		const currentExt = FileHelpers.getFileExtension(currentFile);

		/**
		 * Helper to find a file in the given directory under the given filename
		 * It tries to find all possible filename versions in the sass schema
		 * @param dirName
		 * @param filename
		 */
		const tryToFindFileIn = function (dirName: string, filename: string): string | null {
			// Find possible paths
			const possiblePaths: Set<string> = new Set();
			possiblePaths
				.add(dirName + filename + "." + currentExt)
				.add(dirName + "_" + filename + "." + currentExt)
				.add(dirName + filename + ".sass")
				.add(dirName + "_" + filename + ".sass")
				.add(dirName + filename + ".scss")
				.add(dirName + "_" + filename + ".scss");

			// Try to resolve the file path
			let foundPath: string | null = null;
			forEach(possiblePaths, (possiblePath: string) => {
				if (fs.existsSync(possiblePath) && fs.lstatSync(possiblePath).isFile()) {
					foundPath = possiblePath;
					return false;
				}
			});
			return foundPath;
		};

		// Try to find file in the default directory
		let foundPath = tryToFindFileIn(statementRealPath, statementBasename);
		if (!isNull(foundPath)) return foundPath;

		// Try harder
		output = importPath;

		// Try to resolve "~" in the current path
		if (output.charAt(0) === "~") {
			if (currentFile.indexOf("node_modules") !== -1) {
				const baseParts = currentFile.split(path.sep);
				while (baseParts.length > 2) {
					baseParts.pop();
					const searchPath = path.join(baseParts.join(path.sep), output.replace(/^[~\\\/]+/, ""));
					let foundPath = tryToFindFileIn(path.dirname(searchPath) + path.sep, path.basename(searchPath));
					if (!isNull(foundPath)) return foundPath;
				}
			}
		}

		// Invalid statement
		throw new Error("Could not resolve SASS import: \"" + importPath + "\" in file: \"" + currentFile + "\"!");
	}

	/**
	 * Because node-sass has problems when it comes to the two different sass syntaxes
	 * we traverse any .sass file and convert it into .scss syntax
	 * @param content
	 * @return {*}
	 */
	static sass2scss(content: string | null) {
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
			let comment = "";
			if (commentIndex !== -1) {
				comment = rawLine.slice(commentIndex);
				rawLine = rawLine.slice(0, commentIndex);
			}
			const lineData = {
				text: rawLine,
				comment: comment,
				indent: indent,
				empty: false
			};

			// Check if line is empty
			if (lineData.text.trim().length === 0) {
				lineData.empty = true;
				parsedLines.push(lineData);
				continue;
			}

			// Check if we are starting a block comment
			if (lineData.text.match(/(?:^|\s)\/\*/)) {
				inBlockComment = true;
				lineData.empty = true;
				lineData.text = "//" + lineData.text;
				parsedLines.push(lineData);
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
				parsedLines[lastLineWithContent].text += "};".repeat(layers);
			}

			lastIndent = indent;

			parsedLines.push(lineData);
			lastLineWithContent = parsedLines.length - 1;
		}

		// Drop finisher line
		parsedLines.pop();

		// Rebuild parsed lines into a list of scss lines
		const outputLines = [];
		forEach(parsedLines, (line) => {
			if (line.empty !== true) {
				// Try to find empty selectors which may break the process
				if (line.text.indexOf(":") === -1 && (
					// Empty selector
					line.text.match(/^\s*[^:+=@\n{}]*?[^\n{,]$/) ||
					// Empty statement
					line.text.match(/^\s*@(if|else if|elseif|else)[^\n{}]*?[^\n{,]$/)
				)) {
					line.text += "{}";
				}

				// Add semicolon to line if required
				if (line.text.match(/[^,{](?:\s)?$/)) {
					line.text += ";";
				}
			}

			outputLines.push(line.text + " " + line.comment);
		});
		let output = outputLines.join("\r\n");

		// Replace mixin definitions
		output = output.replace(/(^\s*)([+=])(\s*)/gm, (a, before, char, after) => {
			return before + (char === "+" ? "@include " : "@mixin ") + after;
		});

		// Remove all semicolons in front of an "else"
		output = output.replace(/(});+([^;]*?@else)/gm, "$1$2");

		// Done
		return output;
	}
}