/**
 * Created by Martin Neundorfer on 29.01.2019.
 * For LABOR.digital
 */
const WebpackFilterWarningsPlugin = require("webpack-filter-warnings-plugin");

module.exports = class FilterWarningsPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// Build the list of by default ignored warnings
		const warningsToIgnore = context.callPluginMethod("filterWarningsToIgnore", [
			[
				// Caused by some sort of some non matching tree layout architecture doohickey o.O
				// We don't care, tho: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
				/mini-css-extract-plugin[^]*Conflicting order between:/
			],
			context
		]);

		// Inject the plugin
		context.webpackConfig.plugins.push(
			new WebpackFilterWarningsPlugin(
				...context.callPluginMethod("filterPluginConfig", [
					[{
						exclude: warningsToIgnore
					}],
					"filterWarningsPlugin", context]
				)));
	}
};