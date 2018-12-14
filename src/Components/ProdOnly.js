/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const merge = require("webpack-merge");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = class ProdOnly {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (!context.isProd) return;

		context.webpackConfig = merge(context.webpackConfig, {
			optimization: {
				minimize: true,
				minimizer: [
					// JS Uglyfier
					new UglifyJsPlugin({
							cache: true,
							parallel: true,
							sourceMap: true,
							extractComments: true,
							uglifyOptions: {
								mangle: true,
								ecma: 5,
								toplevel: true,
								compress: {
									typeofs: false
								}
							}
						}
					),
					// CSS Uglyfier
					new OptimizeCssAssetsPlugin({
						cssProcessorOptions: {
							map: {
								inline: false,
								annotation: true
							}
						}
					})
				]
			}
		});
	}
};