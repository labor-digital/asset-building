/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
module.exports = class JsCompat {
	/**
	 * Applies this configuration component to the current context
	 * @param {module.ConfigBuilderContext} context
	 */
	static apply(context) {
		if (!Array.isArray(context.currentAppConfig.jsCompat) || context.currentAppConfig.jsCompat.length === 0) return;
		// Register import loader rules
		context.currentAppConfig.jsCompat.forEach((config, k) => {
			// Validate
			if (typeof config !== "object") throw new Error("Invalid js compat configuration at key: " + k);
			if (typeof config.rule !== "string" || config.rule.trim().length === 0)
				throw new Error("Invalid or missing js compat \"rule\" at key: " + k);
			if (typeof config.fix !== "string" || config.fix.trim().length === 0)
				throw new Error("Invalid or missing js compat \"fix\" at key: " + k);

			// Add imports loader if fix misses it
			if (config.fix.indexOf("imports-loader?") !== 0) config.fix = "imports-loader?" + config.fix;

			// Add new module
			context.webpackConfig.module.rules.push({
				"test": new RegExp(config.rule),
				"loader": config.fix
			})
		});
	}
};