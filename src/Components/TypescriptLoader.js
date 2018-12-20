/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const path = require("path");
module.exports = class TypescriptLoader {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		// Prepare exclude pattern
		const baseExcludePattern = /node_modules(?![\\/\\\\]@labor[\\/\\\\])/;
		const excludePattern = context.callPluginMethod("filterExcludePattern", [
			context.builderVersion === 1 ? baseExcludePattern : undefined,
			"typescript", baseExcludePattern, context
		]);

		context.webpackConfig.module.rules.push(
			context.callPluginMethod("filterLoaderConfig", [
				{
					test: context.callPluginMethod("filterLoaderTest", [/\.js$|\.ts$|\.tsx$/, "typescriptLoader", context]),
					exclude: excludePattern === null ? undefined : excludePattern,
					use: [
						{
							"loader": "ts-loader",
							"options": context.callPluginMethod("filterTypescriptOptions", [
								{
									"context": context.dir.current,
									"configFile": path.resolve(context.dir.controller, "../ts/tsconfig.json"),
									"transpileOnly": !(context.currentAppConfig.useTypeChecker === true),
									"experimentalWatchApi": true,
									"onlyCompileBundledFiles": true,
									"compilerOptions": {
										"allowJs": true,
										"target": "es5",
										"moduleResolution": "node",
										"module": "esnext"
									}
								},
								context
							])
						}
					]
				},
				"typescriptLoader", context
			]));
	}
};