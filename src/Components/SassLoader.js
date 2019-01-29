/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = class SassLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// Sass and css loader
		// We route the css over the sass parser, because our internal script will take care of
		// any urls which could otherwise not be resolved correctly
		if (context.builderVersion === 1)
			SassLoader._applyLegacy(context);
		else
			SassLoader._applyDefault(context);
	}

	static _applyDefault(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.(sa|sc|c)ss$/, "sassLoader", context]),
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
								import: true
							}
						},
						{
							loader: path.resolve(context.dir.controller, "./WebpackLoaders/CustomSassLoader/CustomSassLoader.js"),
							options: {
								currentAppConfig: context.currentAppConfig,
								context
							}
						}
					]
				},
				"sassLoader", context
			]));
	}

	static _applyLegacy(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.(sa|sc|c)ss$/, "sassLoader", context]),
					use: [
						{
							loader: MiniCssExtractPlugin.loader
						},
						{
							loader: "css-loader?url=false&-url",
							options: {
								import: false,
								url: false
							}
						},
						{
							loader: "sass-loader?sourceMapRoot=foo",
							options: {
								sourceMap: true,
								outputStyle: "expanded",
								sourceMapContents: true
							}
						}
					]
				},
				"sassLoader", context
			]));
	}
};