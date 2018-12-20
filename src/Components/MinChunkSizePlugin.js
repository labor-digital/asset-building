/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const webpack = require("webpack");
const WebpackFixBrokenChunkPlugin = require("../Bugfixes/WebpackFixBrokenChunkPlugin");
module.exports = class MinChunkSizePlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// This plugin prevents Webpack from creating chunks
		// that would be too small to be worth loading separately
		if (context.currentAppConfig.minChunkSize !== 0) {
			context.webpackConfig.plugins.push(
				new webpack.optimize.MinChunkSizePlugin(
					context.callPluginMethod("filterPluginConfig", [
						{
							minChunkSize: typeof context.currentAppConfig.minChunkSize === "undefined" ?
								10000 : context.currentAppConfig.minChunkSize
						},
						"minChunkSizePlugin", context
					])
				));
		}

		// Load a bugfix for a crash that happens while using promises, if the plugin above is used
		context.webpackConfig.plugins.push(new WebpackFixBrokenChunkPlugin());
	}
};