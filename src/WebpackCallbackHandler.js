/**
 * Created by Martin Neundorfer on 14.12.2018.
 * For LABOR.digital
 */
const chalk = require("chalk");
const MiscHelpers = require("./Helpers/MiscHelpers");
const FileHelpers = require("./Helpers/FileHelpers");

module.exports = class WebpackCallbackHandler {
	/**
	 * Handles the callback when webpack is done compiling
	 * @param {module.ConfigBuilderContext} context
	 * @param err
	 * @param stats
	 */
	static handle(context, err, stats) {
		if (err) throw new Error(err.stack || err);

		// Generate output
		let statsJson = stats.toJson({
			assets: true,
			errorDetails: false,
			publicPath: true
		});

		// Call hooks
		statsJson = context.callPluginMethod("compilingDone", [statsJson, context]);

		// Define column char lengths
		const assetColLength = 70;
		const sizeColLength = 14;

		// 1 if there were errors or warnings
		let exitCode = 0;

		// Render output
		console.log("");
		console.log("COMPILING DONE:", new Date().toLocaleTimeString());
		console.log(MiscHelpers.drawLine());
		let times = [];
		let numberOfErrors = 0;
		let numberOfWarnings = 0;

		// Check if we are watching or building
		const isWatch = Array.isArray(context.webpackConfig) ? context.webpackConfig[0].watch : context.webpackConfig.watch;

		// Run trough all children
		statsJson.children.forEach(child => {
			// Prepare the context for app based execution
			context.currentApp = parseInt(child.name);
			context.currentAppConfig = context.laborConfig.apps[context.currentApp];

			// Apply legacy child filter
			if (context.builderVersion === 1) {
				const LegacyAdapter = require("./LegacyAdapter");
				LegacyAdapter.childFilter(child, context);
			}

			// Call hooks
			child = context.callPluginMethod("filterChildStats", [child, context]);

			// Render a separator between different apps
			if (times.length !== 0) {
				console.log(MiscHelpers.drawLine("-"));
				console.log("");
			}

			// Render the asset list
			let time = child.time > 5000 ? Math.round(child.time / 100) / 10 + "s" : child.time + "ms";
			times.push(time);
			console.log("APP-" + context.currentApp + " | Time: " + time);
			console.log("Asset".padStart(assetColLength, " ") + "  " + "Size".padStart(sizeColLength));
			let ignoredChunks = 0;
			let ignoredSize = 0;
			child.assets.forEach(asset => {
				// console.log(' - > ', asset.name, asset.chunks, asset.chunkNames);
				const isMap = asset.name.match(/\.map$/);
				const isHotUpdate = asset.name.match(/\.hot-update\./);
				const chunkIsMain = typeof asset.chunks[0] === "string" && asset.chunks[0].indexOf("main") === 0;
				const chunkNameIsMain = typeof asset.chunkNames[0] === "string" && asset.chunkNames[0].indexOf("main") === 0
				const useAsset = !isMap && !isHotUpdate && (chunkIsMain || chunkNameIsMain);

				if (!useAsset) {
					ignoredChunks++;
					ignoredSize += asset.size;
					return;
				}
				let realAssetName = (child.outputPath + "/" + asset.name).replace(/[\\\/]/g, "/");
				console.log(
					chalk.greenBright(realAssetName.substr(-(assetColLength - 5)).padStart(assetColLength)) + "  "
					+ FileHelpers.humanFileSize(asset.size).padStart(sizeColLength));
			});
			if (ignoredChunks !== 0)
				console.log(("  + " + ignoredChunks + " hidden files (maps, chunks, assets, and so on)").padStart(assetColLength) + "  " +
					FileHelpers.humanFileSize(ignoredSize).padStart(sizeColLength));

			// Check if there are warnings
			if (child.warnings.length > 0) {
				exitCode = 1;
				numberOfWarnings += child.warnings.length;
				console.log(MiscHelpers.drawLine("."));
				console.log("");
				console.error(chalk.yellowBright("BEWARE! There are warnings!"));
				console.log("");
				child.warnings.forEach(entry => {
					let isBreak = false;
					entry.split(/\r?\n/).forEach(line => {
						if (isBreak || line.match(/\sproblems?\s\(.*?\serrors?,\s.*?\swarnings?\)/)) {
							isBreak = true;
							return;
						}
						console.log(chalk.yellowBright(line));
					});
				});
			}

			// Check if there are errors
			if (child.errors.length > 0) {
				exitCode = 1;
				numberOfErrors += child.errors.length;
				console.log(MiscHelpers.drawLine("."));
				console.log("");
				console.error(chalk.redBright("MISTAKES HAVE BEEN MADE!"));
				console.log("");
				child.errors.forEach((entry, i) => {
					let isBreak = false;
					if (i > 0) console.log("");
					entry.split(/\r?\n/).forEach(line => {
						// Strip footer for problems with eslint
						if (isBreak || line.match(/\sproblems?\s\(.*?\serrors?,\s.*?\swarnings?\)/)) {
							isBreak = true;
							return;
						}
						console.log(chalk.redBright(line));
					});
				});
			}

			// Make sure everything is added to our git when the build is complete
			if (!isWatch && context.currentAppConfig.disableGitAdd !== true) WebpackCallbackHandler._autoAddOutputToGit(child, context);
		});

		// Render a footer
		console.log(MiscHelpers.drawLine());
		let state = numberOfWarnings === 0 && numberOfErrors === 0 ? chalk.greenBright("OK") : "";
		if (numberOfWarnings > 0) state = chalk.yellowBright(numberOfWarnings + " warning" + (numberOfWarnings === 1 ? "" : "s"));
		if (numberOfWarnings !== 0 && numberOfErrors !== 0) state += " | ";
		if (numberOfErrors > 0) state += chalk.redBright(numberOfErrors + " error" + (numberOfErrors === 1 ? "" : "s"));
		console.log(new Date().toLocaleTimeString(), "| Time:", times.join(", "), " |", state);

		// Call hooks
		context.callPluginMethod("callbackDone", [context]);

		// Kill if we don't watch
		if (!isWatch && context.laborConfig.keepAlive !== true) process.exit(exitCode);
	}

	/**
	 * Internal helper to make sure all files are added to git after the compiling is done
	 * @param child
	 * @private
	 */
	static _autoAddOutputToGit(child) {
		try {
			const childProcess = require("child_process");
			childProcess.execSync("git add " + child.outputPath, {stdio: "pipe"});
			console.log(chalk.greenBright("The built files in " + child.outputPath.substr(-50) + " were added to git!"));
		} catch (e) {
			console.log(chalk.yellowBright("Failed to automagically add files in " + child.outputPath + " to git"));
		}
	}
};