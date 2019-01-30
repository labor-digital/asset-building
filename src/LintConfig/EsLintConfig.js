/**
 * Created by Martin Neundorfer on 07.09.2018.
 * For LABOR.digital
 */
/**
 * The es lint config used by WebpackConfigBuilder_1 which contains mostly the original es lint configuration.
 * @type {module.EsLintConfig}
 */
module.exports = class EsLintConfig {
	/**
	 * @param {module.ConfigBuilderContext} context
	 */
	constructor(context) {
		// this.cache = true;
		this.parser = "babel-eslint";
		this.env = {"browser": true};
		this.ecmaFeatures = {"jsx": true};
		if (context.isProd) this.extends = "eslint:recommended";
		this.plugins = ["import"];
		this.parserOptions = {
			"ecmaVersion": 2017,
			"sourceType": "module",
			"ecmaFeatures": {"impliedStrict": true}
		};
		this.globals = [
			"document:true",
			"console:true",
			"window:true",
			"setTimeout:true",
			"setInterval:true",
			"clearTimeout:true",
			"clearInterval:true",
			"define:true",
			"jQuery:true",
			"location:true",
			"makeDiv:true",
			"module:true",
			"exports:true",
			"localStorage:true",
			"alert:true",
			"navigator:true",
			"screen:true",
			"event:true",
			"DOMParser:true",
			"ActiveXObject:true",
			"Symbol:true",
			"prefixes:true",
			"enableClasses:true",
			"Image:true",
			"require:true",
			"HTMLElement:true",
			"history:true",
			"Int8Array:true",
			"FormData:true",
			"Promise:true",
			"Map:true",
			"Set:true",
			"Date:true",
			"File:true",
			"XMLHttpRequest:true",
			"ActiveXObject:true"
		];
		this.rules = {
			"comma-dangle": ["error", "never"],
			"no-undef": "error",
			"max-len": "off",
			"import/default": "off",
			"import/export": "error",
			"import/first": "warn",
			"import/namespace": ["error", {allowComputed: true}],
			"import/no-duplicates": "error",
			"import/order": "off"
		};
		if (context.isProd) this.rules = Object.assign(this.rules, {
			"no-dupe-args": "error",
			"no-duplicate-case": "error",
			"no-template-curly-in-string": "error",
			"no-unexpected-multiline": "error",
			"no-unsafe-finally": "error",
			"no-unsafe-negation": "error",
			"no-constant-condition": "error",
			"no-control-regex": "error",
			"no-debugger": "error",
			"no-dupe-keys": "error",
			"no-empty-character-class": "error",
			"no-ex-assign": "error",
			"no-extra-boolean-cast": "error",
			"no-extra-parens": "off",
			"no-extra-semi": "warn",
			"no-func-assign": "error",
			"no-inner-declarations": "warn",
			"no-invalid-regexp": "error",
			"no-irregular-whitespace": "error",
			"no-negated-in-lhs": "error",
			"no-obj-calls": "error",
			"no-regex-spaces": "error",
			"no-reserved-keys": "off",
			"no-sparse-arrays": "error",
			"no-unreachable": "error",
			"use-isnan": "error",
			"valid-jsdoc": "off",
			"valid-typeof": "error"
		});
	}
};