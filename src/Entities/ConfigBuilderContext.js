/**
 * Created by Martin Neundorfer on 06.09.2018.
 * For LABOR.digital
 */
module.exports = class ConfigBuilderContext {
	/**
	 * Injects the basic configuration
	 * @param {*} laborConfig
	 * @param {module.Dir} dir
	 */
	constructor(laborConfig, dir) {

		/**
		 * The version number of the current config builder
		 * @type {number}
		 */
		this.builderVersion = 1;

		/**
		 * Can be used to define an additional layer of configuration, which may be used based on the used framework
		 * @type {string|null}
		 */
		this.environment = null;

		/**
		 * The numeric zero-based index of the app which is currently configured.
		 * -1 If there is currently no app based action underway
		 * @type {number}
		 */
		this.currentApp = -1;

		/**
		 * The configuration containing the laborConfig of the app which is currently configured
		 * @type {*}
		 */
		this.currentAppConfig = {};

		/**
		 * True if this build should be executed as webpack's "production" mode
		 * @type {boolean}
		 */
		this.isProd = false;

		/**
		 * The mode key which was given as cli parameter
		 * @type {string}
		 */
		this.mode = "";

		/**
		 * Contains the configuration given in the package.json in the "labor" node
		 * @type {*}
		 */
		this.laborConfig = laborConfig;

		/**
		 * Contains the webpack configuration we are currently working on
		 * @type {{}}
		 */
		this.webpackConfig = {};

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
		this.callback = () => {
		};
	}

	/**
	 * Internal helper to loop over all plugin instances and call a requested method on them.
	 * The given arguments should be an array. If the method returns a value args[0] will automatically
	 * be reset to the result. With that it is possible to pass a value through all plugin instances to filter it.
	 *
	 * @param {string} method
	 * @param {Array} args
	 * @returns {*}
	 */
	callPluginMethod(method, args) {
		this.plugins.forEach(plugin => {
			if (typeof plugin[method] !== "function") return;
			let result = plugin[method].apply(plugin, args);
			if (typeof result !== "undefined") args[0] = result;
		});
		return typeof args[0] !== "undefined" ? args[0] : null;
	}
};