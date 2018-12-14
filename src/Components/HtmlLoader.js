/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
module.exports = class HtmlLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context){
		context.webpackConfig.module.rules.push({
			test: /\.html$/,
			use: [{
				loader: "html-loader"
			}]
		});
	}
};