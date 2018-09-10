/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const kill = require('../../Helpers/kill');
module.exports = function buildJsCompatConfig(webpackConfig, jsCompatConfig, context) {
	// Register import loader rules
	jsCompatConfig.forEach((config, k) => {
		// Validate
		if (typeof config !== 'object') kill('Invalid js compat configuration at key: ' + k);
		if (typeof config.rule !== 'string' || config.rule.trim().length === 0)
			kill('Invalid or missing js compat "rule" at key: ' + k);
		if (typeof config.fix !== 'string' || config.fix.trim().length === 0)
			kill('Invalid or missing js compat "fix" at key: ' + k);

		// Add imports loader if fix misses it
		if (config.fix.indexOf('imports-loader?') !== 0) config.fix = 'imports-loader?' + config.fix;

		// Add new module
		webpackConfig.module.rules.push({
			'test': new RegExp(config.rule),
			'loader': config.fix
		})
	});
};