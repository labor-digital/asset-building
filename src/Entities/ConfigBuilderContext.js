/**
 * Created by Martin Neundorfer on 06.09.2018.
 * For LABOR.digital
 */
module.exports = class ConfigBuilderContext {
	constructor(laborConfig, dir, mode) {

		/**
		 * The version numberof the current config builder
		 * @type {number}
		 */
		this.builderVersion = 1;

		/**
		 * Only used in version 2 of the builder. The numeric zero-based index of the app which is currently compiled.
		 * @type {number}
		 */
		this.currentApp = 0;

		/**
		 * True if this build should be executed as webpack's "production" mode
		 * @type {boolean}
		 */
		this.isProd = false;

		/**
		 * The mode key which was given as cli parameter
		 * @type {string}
		 */
		this.mode = mode;

		/**
		 * Contains the configuration given in the package.json in the "labor" node
		 * @type {*}
		 */
		this.laborConfig = laborConfig;

		/**
		 * Contains the webpack configuration we are currently working on
		 * @type {{}}
		 */
		this.webpackConfig = {
			'mode': 'production',
			'watch': false,
			'entry': {},
			'plugins': [],
			'module': {
				'rules': []
			},
			'performance': {
				'hints': false
			},
			'resolve': {
				'modules': ['node_modules', dir.nodeModules, dir.buildingNodeModules]
			},
			'resolveLoader': {
				'modules': ['node_modules', dir.buildingNodeModules, dir.nodeModules, '/']
			}
		};

		/**
		 * The list of plugininstances that are currently registerd in the package.json
		 * @type {Array}
		 */
		this.plugins = [];

		/**
		 * Frequently used path of this context
		 * @type {module.Dir}
		 */
		this.dir = dir;

		/**
		 * The callback for the webpack compiler
		 * @type {function}
		 */
		this.callback = () => {};
	}

	/**
	 * Internal helper to loop over all plugin instances and call a requested method on them.
	 * The given arguments should be an array. If the method returns a value args[0] will automatically
	 * be reset to the result. With that it is possible to pass a value through all plugin instances to filter it.
	 *
	 * @param {string} method
	 * @param {Array} args
	 * @returns {null}
	 */
	callPluginMethod (method, args){
		this.plugins.forEach(plugin => {
			if (typeof plugin[method] !== 'function') return;
			let result = plugin[method].apply(plugin, args);
			if (typeof result !== 'undefined') args[0] = result;
		});
		return typeof args[0] !== 'undefined' ? args[0] : null;
	}
};