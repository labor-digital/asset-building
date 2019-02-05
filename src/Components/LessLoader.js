/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Postcss = require("./SubComponents/Postcss");

module.exports = class LessLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (context.builderVersion === 1)
			LessLoader._applyLegacy(context);
		else
			LessLoader._applyDefault(context);
	}

	static _applyDefault(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.less$/, "lessLoader", context]),
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
						},
						Postcss.makeConfig(context),
						{
							loader: "less-loader"
						},
						{
							loader: path.resolve(context.dir.controller, "./WebpackLoaders/ResourceLoader/ResourceLoader.js"),
							options: {
								currentDir: context.dir.current,
								entry: context.currentAppConfig.entry,
								ext: ["less", "css"]
							}
						}
					]
				},
				"lessLoader", context
			]));
	}

	static _applyLegacy(context) {
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.less$/, "lessLoader", context]),
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
						},
						Postcss.makeConfig(context),
						{
							loader: "less-loader",
							options: {
								relativeUrls: false,
								sourceMap: true
							}
						}
					]
				},
				"lessLoader", context
			]));
	}
};