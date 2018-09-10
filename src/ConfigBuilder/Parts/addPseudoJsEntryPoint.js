/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const fs = require('fs');
/**
 * Adds a pseudo js file of no real entries where given, but our additional
 * scripts require webpack to run. With this pseudofile webpack has a valid entrypoint to compile and everybody is happy.
 * @param laborConfig
 * @param context
 */
module.exports = function addPseudoJsEntryPoint(laborConfig, context) {
	let tmpInput = './node_modules/@labor/tmp/tmp-js.js';
	let tmpOutput = './node_modules/@labor/tmp/ignore-me.js';
	let realFile = context.dir.nodeModules + '@labor/tmp/tmp-js.js';
	if (!fs.existsSync(realFile)) {
		try {
			fs.mkdirSync(context.dir.nodeModules + '@labor/tmp');
		} catch (e) {
		}
		fs.writeFileSync(realFile, 'alert(\'hallo\');');
	}
	laborConfig.js = [
		{
			'entry': tmpInput,
			'output': tmpOutput
		}
	];
};