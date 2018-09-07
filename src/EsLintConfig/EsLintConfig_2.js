/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
const EsLintConfig_1 = require('./EsLintConfig_1');
module.exports = class EsLintConfig_2 extends EsLintConfig_1{
	/**
	 * @param {boolean} isProd
	 */
	constructor(isProd) {
		super(true);
		this.parser = 'babel-eslint';
		this.env = {'browser': true};
		this.extends = 'eslint:recommended';
		this.parserOptions = {
			'ecmaVersion': 2017,
			'sourceType': 'module',
			'ecmaFeatures': {'impliedStrict': true},
		};
		this.plugins = ['import'];
		this.rules = Object.assign(this.rules, {
			'import/default': 'off',
			'import/export': 'error',
			'import/first': 'warn',
			'import/namespace': ['error', {allowComputed: true}],
			'import/no-duplicates': 'error',
			'import/order': ['warn', {
				groups: [['builtin', 'external'], 'internal', ['parent', 'index', 'sibling']],
				'newlines-between': 'ignore',
			},
			],
		});

	}
};