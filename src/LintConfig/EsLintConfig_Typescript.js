/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
const EsLintConfig = require('./EsLintConfig');

module.exports = class EsLintConfig_Typescript extends EsLintConfig {

	/**
	 * @param {module.ConfigBuilderContext} context
	 */
	constructor(context) {
		super(context.isProd);
		this.parser = 'typescript-eslint-parser';
	}
};