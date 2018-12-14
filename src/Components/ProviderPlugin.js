/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const webpack = require("webpack");
module.exports = class ProviderPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		const providerConfig = context.callPluginMethod("getJsProvides", [{}, context]);
		context.webpackConfig.plugins.push(
			new webpack.ProvidePlugin(providerConfig)
		);
	}
};