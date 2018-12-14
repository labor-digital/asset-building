/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const merge = require("webpack-merge");
module.exports = class DevOnly {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (context.isProd) return;
		context.webpackConfig = merge(context.webpackConfig, {
			output: {
				pathinfo: false
			},
			optimization: {
				removeAvailableModules: false,
				removeEmptyChunks: false,
				splitChunks: false
			}
		});
	}
};