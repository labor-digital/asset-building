/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = class CopyPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (!Array.isArray(context.laborConfig.copy) || context.laborConfig.copy.length === 0) return;

		// Add the context to all configurations
		context.laborConfig.copy.forEach(config => {

			// Validate input
			if (typeof config.from === "undefined")
				throw new Error("Your copy configuration does not define a \"from\" key!");

			// Add context if required
			if (typeof config.context === "undefined") config.context = context.dir.current;

			// Check if we have to rewrite the "from" -> Array to string
			if (Array.isArray(config.from)) {
				var thisValue = config.from.shift();
				var jsonConfig = JSON.stringify(config);
				config.from.forEach(v => {
					var newConfig = JSON.parse(jsonConfig);
					newConfig.from = v;
					context.laborConfig.copy.push(newConfig);
				});
				config.from = thisValue;
			}
		});

		// Make sure we can resolve node modules
		context.laborConfig.copy.forEach(config => {
			// Remove all glob related stuff from the path
			let fromDirectory = path.dirname(config.from.replace(/\*.*?$/, ""));
			let fromPrefix = "";
			if (fromDirectory.length > 0 && !fs.existsSync(fromDirectory)) {
				for (let directory of [context.dir.nodeModules, context.dir.buildingNodeModules, context.dir.current]) {
					fromPrefix = directory;
					if (fs.existsSync(fromPrefix + fromDirectory)) break;
					fromPrefix = "";
				}
				config.from = fromPrefix + config.from;
			}
		});

		// Add copy plugin
		context.webpackConfig.plugins.push(new CopyWebpackPlugin(
			context.callPluginMethod("filterPluginConfig", [
				context.laborConfig.copy,
				"copyPlugin", context
			])
		));
	}
};