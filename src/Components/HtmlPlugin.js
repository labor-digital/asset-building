/**
 * Created by Martin Neundorfer on 18.12.2018.
 * For LABOR.digital
 */
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = class HtmlPlugin {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context){
		if(typeof context.currentAppConfig.htmlTemplate === "undefined") return;

		// Apply a basic configuration
		let template = context.currentAppConfig.htmlTemplate;
		if(template === true) template = {};
		if(typeof template.template === "undefined"){
			template.template = require("html-webpack-template");
			if(typeof template.inject === "undefined") template.inject = false;
		}
		if(typeof template.appMountId === "undefined") template.appMountId = "app";
		template = context.callPluginMethod("filterHtmlTemplate", [template, context]);

		// Inject the plugin
		context.webpackConfig.plugins.push(new HtmlWebpackPlugin(template));
	}
};