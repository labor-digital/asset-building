/**
 * Created by Martin Neundorfer on 08.01.2019.
 * For LABOR.digital
 */
const MiscHelpers = require("../../Helpers/MiscHelpers");

module.exports = class Postcss {
	/**
	 * Defines the post css configuration for sass and less loaders
	 * @param {module.ConfigBuilderContext} context
	 */
	static makeConfig(context) {
		return {
			loader: "postcss-loader",
			options: {
				ident: "postcss-" + MiscHelpers.md5(Math.random() + "" + Math.random()),
				plugins: () => Postcss.getPostCssPluginList(context)
			}
		};
	}

	/**
	 * Applies the post css post processing to a given css content.
	 * This is used in the custom sass loader
	 * @param {string} css The content of the css file to process
	 * @param {module.ConfigBuilderContext} context
	 * @return {Promise} The lazy result object
	 */
	static applyPostProcessing(css, context) {
		const postcss = require("postcss");
		return postcss(Postcss.getPostCssPluginList(context)).process(css);
	}

	/**
	 * Returns the list of all required postcss plugins
	 * @param context
	 * @return {*}
	 */
	static getPostCssPluginList(context) {
		return context.callPluginMethod("postCssPluginFilter", [
			[
				require("autoprefixer")({
					browsers: context.callPluginMethod("browserListFilter", ["> 1%, last 10 versions", context])
				})
			], context
		]);
	}
};