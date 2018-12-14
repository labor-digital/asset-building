/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const FileHelpers = require("../Helpers/FileHelpers");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = class CssExtractPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context){
		const outputFileWithoutExtension = FileHelpers.getFileWithoutExtension(context.webpackConfig.output.filename);
		context.webpackConfig.plugins.push(new MiniCssExtractPlugin({
			filename: "css/" + outputFileWithoutExtension + ".css",
			chunkFilename: "css/" + outputFileWithoutExtension +
				(context.isProd ? "-[id]-[hash].css" : "-[id].css")
		}));
	}
};