/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const EsLintConfig = require("../LintConfig/EsLintConfig");
const EsLintConfig_Typescript = require("../LintConfig/EsLintConfig_Typescript");
module.exports = class EsLint {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {

		// Prepare exclude pattern
		const baseExcludePattern = /node_modules(?![\\/\\\\]@labor[\\/\\\\])/;
		const excludePattern = context.callPluginMethod("filterExcludePattern", [
			context.builderVersion === 1 ? baseExcludePattern : undefined,
			"esLint", baseExcludePattern, context
		]);

		// Javascript
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.js$/, "jsLintLoader", context]),
					exclude: excludePattern === null ? undefined : excludePattern,
					enforce: "pre",
					use: [
						{
							loader: "eslint-loader",
							options: context.callPluginMethod("filterEslintOptions", [
								new EsLintConfig(context), context, "javascript"])
						}
					]
				},
				"jsLintLoader", context
			]));

		// Typescript
		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.ts$|\.tsx$/, "tsLintLoader", context]),
					exclude: excludePattern === null ? undefined : excludePattern,
					enforce: "pre",
					use: [
						{
							loader: "eslint-loader",
							options: context.callPluginMethod("filterEslintOptions", [
								new EsLintConfig_Typescript(context), context, "typescript"])
						}
					]
				},
				"tsLintLoader", context
			]));
	}
};