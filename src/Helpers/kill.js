/**
 * Created by Martin Neundorfer on 06.09.2018.
 * For LABOR.digital
 */

/**
 * Helper to kill the script and pretty print the reason of death
 * @param {string} message
 */
module.exports = function kill(message){
	console.error('');
	console.error('\x1b[31mFATAL ERROR! Sadly I could not recover :(\x1b[0m');
	console.error('\x1b[31m"' + message +'"\x1b[0m');
	console.error('');
	process.exit();
};