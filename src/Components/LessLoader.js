/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = class LessLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context){
		if(context.builderVersion === 1)
			LessLoader._applyLegacy(context);
		else
			LessLoader._applyDefault(context);
	}

	static _applyDefault(context){
		context.webpackConfig.module.rules.push({
			test: /\.less$/,
			use: [
				{
					loader: MiniCssExtractPlugin.loader,
					options: {
						publicPath: "../"
					}
				},
				{
					loader: "css-loader",
					options: {
						import: false
					}
				}, {
					loader: "less-loader"
				}
			]
		});
	}

	static _applyLegacy(context){
		context.webpackConfig.module.rules.push({
			test: /\.less$/,
			use: [
				{
					loader: MiniCssExtractPlugin.loader
				},
				{
					loader: "css-loader",
					options: {
						import: false,
						url: false
					}
				}, {
					loader: "less-loader",
					options: {
						relativeUrls: false,
						sourceMap: true
					}
				}
			]
		});
	}
};