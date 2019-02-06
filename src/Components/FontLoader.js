/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const MiscHelpers = require("../Helpers/MiscHelpers");
module.exports = class fontLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (context.builderVersion === 1) return;

		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/, "fontLoader", context]),
					use: [
						{
							loader: "file-loader",
							options: {
								name: (file) => {
									if(context.isProd) return "[name]-[hash].[ext]";
									// Use a weak hash -> https://www.bountysource.com/issues/30111085-process-out-of-memory-webpack
									return "[name]-" + MiscHelpers.md5(file) + ".[ext]";
								},
								outputPath: "assets/"
							}
						}
					]
				},
				"fontLoader", context
			]));
	}
};