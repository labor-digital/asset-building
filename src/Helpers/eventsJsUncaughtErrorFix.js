/**
 * Created by Martin Neundorfer on 07.11.2018.
 * For LABOR.digital
 */
const Colors = require("./Colors");

/**
 * I apply this fix, because I got errors like the following, if required files were deleted when
 * using webpacks "watch" mode. The error can be handled internally without a major problem, the script
 * got killed, because events.js complained about an "unhandled error".
 *
 * To prevent that error, we simply ignore that "throw" and go our merry way... \o/
 *
 * The error example:
 * events.js:183
 * throw er; // Unhandled 'error' event
 *
 * Error: EPERM: operation not permitted, stat '$FILENAME'
 * npm ERR! code ELIFECYCLE
 * npm ERR! errno 1
 *
 */
module.exports = function eventsJsUnchaugtErrorFix() {
	try {
		// Try to load events to apply fix
		const EventEmitter = require("events");
		const _realEmit = EventEmitter.prototype.emit;
		EventEmitter.prototype.emit = function (type) {
			try {
				_realEmit.apply(this, arguments)
			} catch (e) {
				console.error(Colors.red("An internal error occured, we should be able to recover, tho!"));
				console.error(Colors.red(e.Error));
			}
		};
	} catch (e) {
		// Ignore silently
	}
};