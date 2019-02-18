/**
 * Created by Martin Neundorfer on 13.12.2018.
 * For LABOR.digital
 */
const fs = require("fs");
const path = require("path");
const FileHelpers = require("./Helpers/FileHelpers");
const MiscHelpers = require("./Helpers/MiscHelpers");

/**
 * This class is used to apply the required changes for configuration version 1 to
 * run in the context of config builder version 2.
 *
 * This is done by converting all registered assets into single pseudo "apps" that then well be compiled using
 * webpacks multi compiler
 */
module.exports = class LegacyAdapter {
	/**
	 * This helper takes the old config format and converts it into the new, app based config format
	 * so we can be sure every later plugin gets the same config structure
	 * @param {module.ConfigBuilderContext} context
	 */
	static rewriteLaborConfig(context) {

		// Create a work directory
		const tmpDirectory = context.dir.nodeModules + ".cache" + path.sep + "labor-legacy-code-cache" + path.sep;
		FileHelpers.mkdir(tmpDirectory);

		// Check if the config has data
		let hasCss = typeof context.laborConfig.css !== "undefined" && Array.isArray(context.laborConfig.css) && context.laborConfig.css.length > 0;
		let hasJs = typeof context.laborConfig.js !== "undefined" && Array.isArray(context.laborConfig.js) && context.laborConfig.js.length > 0;

		// Create a new app for each asset
		const apps = [];
		let assetToAppConverter = function (config, isStyle) {
			if (typeof config.entry !== "string" || config.entry.trim().length === 0)
				throw new Error("Invalid or missing css \"entry\" at key: " + k);
			if (typeof config.output !== "string" || config.output.trim().length === 0)
				throw new Error("Invalid or missing css \"output\" at key: " + k);
			const setName = MiscHelpers.md5(config.entry);
			const entryFile = tmpDirectory + setName + ".js";
			const outputFile = tmpDirectory + "dist" + path.sep + setName + ".js";
			const entryFileReal = path.resolve(context.dir.current + config.entry);
			const entryFileRelative = path.relative(tmpDirectory, entryFileReal);
			fs.writeFileSync(entryFile, "import \"" + entryFileRelative.replace(/\\/g, "/") + "\";");
			apps.push({
				"entry": path.relative(context.dir.current, entryFile),
				"output": path.relative(context.dir.current, outputFile),
				"@isStyle": isStyle,
				"@legacy": config
			})
		};
		if (hasCss) context.laborConfig.css.forEach(config => assetToAppConverter(config, true));
		if (hasJs) context.laborConfig.js.forEach(config => assetToAppConverter(config, false));

		// Remove legacy keys
		delete context.laborConfig.js;
		delete context.laborConfig.css;

		// Remap keys from global into the apps we create
		["polyfills", "minChunkSize", "useTypeChecker", "jsCompat", "keepOutputDirectory", "environment", "disableGitAdd"].forEach(field => {
			if(typeof context.laborConfig[field] === "undefined") return;
			apps.forEach(app => app[field] = context.laborConfig[field]);
			delete context.laborConfig[field];
		});

		// Inject new apps entry
		if (!Array.isArray(context.laborConfig.apps)) context.laborConfig.apps = [];
		context.laborConfig.apps = context.laborConfig.apps.concat(apps);
	}

	/**
	 * Injects additional plugins to handle additional changes that are required for version 1 to
	 * run propperly in the version 2 context
	 * @param {*} child
	 * @param {module.ConfigBuilderContext} context
	 */
	static childFilter(child, context) {

		// Output filter ot override the filenames
		const appConfig = context.laborConfig.apps[context.currentApp];
		if (typeof appConfig["@legacy"] === "undefined") return child;
		const isStyle = appConfig["@isStyle"];

		// Rewrite output path
		const outputPathReal = path.resolve(context.dir.current, appConfig["@legacy"].output);
		const outputLocation = child.outputPath;
		child.outputPath = path.dirname(outputPathReal);

		// Rewrite the assets
		child.assets.forEach(asset => {
			// Store asset location
			const assetLocation = outputLocation + path.sep + asset.name;
			const isMap = asset.name.match(/\.map$/) !== null;

			// Rewrite style-js files to "map" so we ignore them in the output
			if (isStyle && asset.name.match(/\.js$/)) {
				asset.name = asset.name + ".map";
				return;
			} else if((path.dirname(assetLocation) !== outputLocation) || asset.name.match(/\.(css|js)(?:\.map|LICENSE)?$/) === null) {
				// Ignore all files in sub directories or that are no css / js files
				return;
			} else {
				// Replace filename with output file
				asset.name = path.basename(appConfig["@legacy"].output);
				if (isMap) asset.name += ".map";
			}

			// Move file to real output directory
			const destinationPath = child.outputPath + path.sep + asset.name;
			FileHelpers.mkdir(child.outputPath);
			fs.copyFileSync(assetLocation, destinationPath);
		});
	}
};