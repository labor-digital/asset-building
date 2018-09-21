/**
 * Created by Martin Neundorfer on 13.09.2018.
 * For LABOR.digital
 */
module.exports = function sass2scss(content) {
	if(typeof content !== 'string') return content;

	let lines = content.split(/\r?\n/g);

	// Add finisher line
	lines.push('#');

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
		const indent = rawLine.replace(/^(\s*)(.*?)$/g, '$1').length;

		// Check if we are inside a block comment
		if (inBlockComment) {
			if (indent <= lastIndent) {
				// Closing block comment!
				inBlockComment = false;
				lastIndent = lastIndentBeforeBlockComment;
			} else {
				// Loop comments around the logic
				parsedLines.push({'text': '//' + rawLine, 'comment': '', 'indent': indent, 'empty': true});
				continue;
			}
		}

		// Try to parse out inline comments
		let commentIndex = rawLine.indexOf(' //');
		if(commentIndex === -1 && rawLine.charAt(1) === '/') commentIndex = 0;
		let line = rawLine;
		let comment = '';
		if (commentIndex !== -1) {
			comment = line.slice(commentIndex);
			line = line.slice(0, commentIndex);
		}
		line = {'text': line, 'comment': comment, 'indent': indent};

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
			line.text = '//' + line.text;
			parsedLines.push(line);
			lastIndentBeforeBlockComment = lastIndent;
			lastIndent = indent;
			continue;
		}

		// Check if we are deeper than before
		if (indent > lastIndent) {
			if(indentHistory.indexOf(indent) === -1)
				indentHistory.push(indent);
			// Update last line
			parsedLines[lastLineWithContent].text += '{';
		}

		// Check if we are higher than before
		else if (lastIndent > indent) {
			let layers = 0;
			for(let i = indentHistory.length - 1; i >= 0 ; i--){
				const knownIndent = indentHistory[i];
				if (knownIndent > indent) {
					layers++;
					continue;
				}
				break;
			}
			indentHistory = indentHistory.slice(0, indentHistory.length - layers);
			parsedLines[lastLineWithContent].text += '}'.repeat(layers);
		}

		lastIndent = indent;

		parsedLines.push(line);
		lastLineWithContent = parsedLines.length -1;
	}

	// Drop finisher line
	parsedLines.pop();

	// Rebuild parsed lines into a list of scss lines
	lines = [];
	for (const [index, line] of parsedLines.entries()) {
		if(line.empty !== true){
			// Try to find empty selectors which may break the process
			if(line.text.indexOf(':') === -1 && line.text.match(/^\s*[^:+=@\n]*?[^\n{,]$/)){
				if(!parsedLines[index + 1] || parsedLines[index + 1].indent === line.indent){
					line.text += '{}';
				}
			}

			// Add semicolon to line if required
			if (line.text.match(/[^,{](?:\s)?$/)) {
				line.text += ';';
			}
		}

		lines.push(line.text + ' ' + line.comment);
	}

	let output = lines.join('\r\n');

	// Replace mixin definitions
	output = output.replace(/(^\s*)([+=])(\s*)/gm, (a, before, char, after) => {
		return before + (char === '+' ? '@include ' : '@mixin ') + after;
	});

	// Remove all semicolons in front of an "else"
	output = output.replace(/(});+([^;]*?@else)/gm, '$1$2');

	// Done
	return output;
};