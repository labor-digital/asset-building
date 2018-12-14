/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
module.exports = class CleanOutputDirPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context){
		if(context.builderVersion === 1 || context.currentAppConfig.keepOutputDirectory === true) return;

		const inputDirectory = path.dirname(context.currentAppConfig.entry);
		const outputDirectory = context.webpackConfig.output.path;

		// Add plugin to clean the output directory when the app is compiled
		// But make sure to keep all sources which have been defined in there
		const sourceToExclude = path.relative(outputDirectory, inputDirectory).split(/\\\//).shift();
		const cleanConfig = context.callPluginMethod("filterCleanOptions", [
			{
				directories: [path.basename(outputDirectory)],
				options: {
					root: path.dirname(outputDirectory),
					exclude: sourceToExclude.length > 0 ? [sourceToExclude, sourceToExclude + "/"] : undefined,
					verbose: true
				}
			}, context
		]);
		context.webpackConfig.plugins.push(new CleanWebpackPlugin(cleanConfig.directories, cleanConfig.options));
	}
};