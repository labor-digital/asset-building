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