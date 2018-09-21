/**
 * Created by Martin Neundorfer on 19.09.2018.
 * For LABOR.digital
 */
const EsLintConfig = require('../../LintConfig/EsLintConfig');
const EsLintConfig_Typescript = require('../../LintConfig/EsLintConfig_Typescript');
module.exports = function addEsLintConfig(context){
	// Javascript
	context.webpackConfig.module.rules.push({
		'test': /\.js$|\.ts$|\.tsx$/,
		'enforce': 'pre',
		'use': [
			{
				'loader': 'eslint-loader',
				'options': context.callPluginMethod('filterEslintOptions', [
					new EsLintConfig(context), context, 'javascript'])
			},
		]
	});

	// Typescript
	context.webpackConfig.module.rules.push({
		'test': /\.ts$|\.tsx$/,
		'enforce': 'pre',
		'use': [
			{
				'loader': 'eslint-loader',
				'options': context.callPluginMethod('filterEslintOptions', [
					new EsLintConfig_Typescript(context), context, 'typescript'])
			},
		]
	});
};