/**
 * Created by Martin Neundorfer on 26.09.2018.
 * For LABOR.digital
 */
const childProcess = require('child_process');

/**
 * Returns true if git is locally installed
 * @return {boolean}
 */
function checkIfHasGit(){
	try {
		childProcess.execSync('git --version');
		return true;
	} catch (e) {
		return false;
	}
}

// Check if git is installed
const hasGit = checkIfHasGit();

module.exports = class WebpackAutoAddEmittedFilesToGitPlugin {
	constructor(options){
		this.options = options;
	}

	apply(compiler) {
		// Ignore if we don't have git installed
		if(!hasGit) return;

		// Register to the done event
		compiler.hooks.done.tap('WebpackAutoAddEmittedFilesToGitPlugin', () => {
			try {
				childProcess.exec('git add ' + this.options.outputDirectory);
			} catch (e) {
				throw new Error('Failed to automatically add the output files to your git repository!')
			}
		});
	}
};