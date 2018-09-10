/**
 * Created by Martin Neundorfer on 10.09.2018.
 * For LABOR.digital
 */
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const kill = require('../../Helpers/kill');

/**
 * Prepares the copy configuration to match the copy plugin's syntax but is easier to write.
 * @see https://github.com/webpack-contrib/copy-webpack-plugin
 * @param webpackConfig
 * @param copyConfig
 * @param context
 */
module.exports = function buildCopyConfig(webpackConfig, copyConfig, context) {
	// Add the context to all configurations
	copyConfig.forEach(config => {

		// Validate input
		if (typeof config.from === 'undefined') kill('Your copy configuration does not define a "from" key!');
		if (typeof config.to === 'undefined') kill('Your copy configuration does not define a "to" key!');

		// Add context if required
		if (typeof config.context === 'undefined') config.context = context.dir.current;

		// Check if we have to rewrite the "from" -> Array to string
		if (Array.isArray(config.from)) {
			var thisValue = config.from.shift();
			var jsonConfig = JSON.stringify(config);
			config.from.forEach(v => {
				var newConfig = JSON.parse(jsonConfig);
				newConfig.from = v;
				copyConfig.push(newConfig);
			});
			config.from = thisValue;
		}
	});

	// Make sure we can resolve node modules
	copyConfig.forEach(config => {
		// Remove all glob related stuff from the path
		let fromDirectory = path.dirname(config.from.replace(/\*.*?$/, ''));
		let fromPrefix = '';
		if (fromDirectory.length > 0 && !fs.existsSync(fromDirectory)) {
			for (let directory of [context.dir.nodeModules, context.dir.buildingNodeModules, context.dir.current]) {
				fromPrefix = directory;
				if(fs.existsSync(fromPrefix + fromDirectory)) break;
				fromPrefix = '';
			}
			config.from = fromPrefix + config.from;
		}
	});

	// Add copy plugin
	webpackConfig.plugins.push(new CopyWebpackPlugin(copyConfig));
};