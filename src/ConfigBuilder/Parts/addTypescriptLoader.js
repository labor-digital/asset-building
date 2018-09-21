/**
 * Created by Martin Neundorfer on 20.09.2018.
 * For LABOR.digital
 */
const path = require('path');
module.exports = function addTypescriptLoader(context, useTypechecker) {
	context.webpackConfig.module.rules.push({
		test: /\.js$|\.ts$|\.tsx$/,
		use: [
			{
				'loader': 'ts-loader',
				'options': context.callPluginMethod('filterTypescriptOptions', [
					{
						'context': context.dir.current,
						'configFile': path.resolve(context.dir.controller, '../ts/tsconfig.json'),
						'transpileOnly': !useTypechecker,
						'experimentalWatchApi': true,
						'onlyCompileBundledFiles': true,
						'compilerOptions': {
							'allowJs': true,
							'target': 'ES5',
							"module": "commonjs"
						}
					},
					context
				])
			}
		]
	});
};