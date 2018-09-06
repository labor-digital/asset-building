/**
 * Created by Martin Neundorfer on 06.09.2018.
 * For LABOR.digital
 */
const kill = require('../Helpers/kill');

/**
 * @param {module.ConfigBuilderContext} context
 */
module.exports = function (context) {

	let laborConfig = context.laborConfig;
	if(typeof laborConfig.apps === 'undefined') kill('Missing the "apps" node in your labor config!');


	console.log('V2!', context);
};