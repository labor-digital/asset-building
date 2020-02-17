/*
 * Copyright 2019 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2019.10.06 at 13:37
 */

import {isArray} from "@labor-digital/helferlein/lib/Types/isArray";
import Chalk from "chalk";
import {Stats} from "webpack";
import {AssetBuilderEventList} from "../AssetBuilderEventList";
import {WorkerContext} from "../Core/WorkerContext";
import {FileHelpers} from "../Helpers/FileHelpers";
import {LegacyAdapter} from "../Legacy/LegacyAdapter";

export class DefaultCompilerCallback {

	public handle(context: WorkerContext, statsRaw: Stats): Promise<number> {
		// Generate readable stats
		let stats = statsRaw.toJson({
			assets: true,
			errorDetails: false,
			publicPath: true
		});

		const output = [];

		// Allow filtering
		return context.eventEmitter.emitHook(AssetBuilderEventList.COMPILING_DONE, {
				stats,
				statsRaw,
				context
			})
			.then(args => {
				stats = args.stats;

				// Define column char lengths
				const assetColLength = 70;
				const sizeColLength = 14;

				// 1 if there were errors or warnings
				let exitCode = 0;

				// Render output
				output.push("");
				output.push("COMPILING DONE: " + (new Date().toLocaleTimeString()));
				output.push(this.drawLine());
				let times = [];
				let numberOfErrors = 0;
				let numberOfWarnings = 0;

				// Check if we are watching or building
				const isWatch = context.webpackConfig.watch;

				// Apply legacy stat filter
				if (context.builderVersion === 1)
					stats = LegacyAdapter.statFilter(stats, context);

				// Render a separator between different apps
				if (times.length !== 0) {
					output.push(this.drawLine("-"));
					output.push("");
				}

				// Render the asset list
				let time = stats.time > 5000 ? Math.round(stats.time / 100) / 10 + "s" : stats.time + "ms";
				times.push(time);
				output.push(context.app.appName + " (" + context.webpackConfig.target + ") | Time: " + time);
				output.push("Asset".padStart(assetColLength, " ") + "  " + "Size".padStart(sizeColLength));
				let ignoredChunks = 0;
				let ignoredSize = 0;
				const isCopy = context.app._legacyCopy === true;
				stats.assets.forEach(asset => {
					// output.push(' - > ', asset.name, asset.chunks, asset.chunkNames);
					const isMap = asset.name.match(/\.map$/);
					const isHotUpdate = asset.name.match(/\.hot-update\./);
					const chunkIsMain = typeof asset.chunks[0] === "string" && (asset.chunks[0] as string).indexOf("main") === 0;
					const chunkNameIsMain = typeof asset.chunkNames[0] === "string" && asset.chunkNames[0].indexOf("main") === 0;
					const useAsset = (context.app.verboseResult || !isMap && !isHotUpdate && (chunkIsMain || chunkNameIsMain)) || isCopy;

					if (!useAsset) {
						ignoredChunks++;
						ignoredSize += asset.size;
						return;
					}
					let realAssetName = (stats.outputPath + "/" + asset.name).replace(/[\\\/]/g, "/");
					output.push(
						Chalk.greenBright(realAssetName.substr(-(assetColLength - 5)).padStart(assetColLength)) + "  "
						+ FileHelpers.humanFileSize(asset.size).padStart(sizeColLength));
				});
				if (ignoredChunks !== 0)
					output.push(("  + " + ignoredChunks + " hidden files (maps, chunks, assets, and so on)").padStart(assetColLength) + "  " +
						FileHelpers.humanFileSize(ignoredSize).padStart(sizeColLength));

				// Check if there are warnings
				if (stats.warnings.length > 0) {
					exitCode = 1;
					numberOfWarnings += stats.warnings.length;
					output.push(this.drawLine("."));
					output.push("");
					output.push(Chalk.yellowBright("BEWARE! There are warnings!"));
					output.push("");
					stats.warnings.forEach(entry => {
						let isBreak = false;
						entry.split(/\r?\n/).forEach(line => {
							if (isBreak || line.match(/\sproblems?\s\(.*?\serrors?,\s.*?\swarnings?\)/)) {
								isBreak = true;
								return;
							}
							output.push(Chalk.yellowBright(line));
						});
					});
				}

				// Check if there are errors
				if (stats.errors.length > 0) {
					exitCode = 1;
					numberOfErrors += stats.errors.length;
					output.push(this.drawLine("."));
					output.push("");
					output.push(Chalk.redBright("MISTAKES HAVE BEEN MADE!"));
					output.push("");
					stats.errors.forEach((entry, i) => {
						let isBreak = false;
						if (i > 0) output.push("");
						entry.split(/\r?\n/).forEach(line => {
							// Strip footer for problems with eslint
							if (isBreak || line.match(/\sproblems?\s\(.*?\serrors?,\s.*?\swarnings?\)/)) {
								isBreak = true;
								return;
							}
							output.push(Chalk.redBright(line));
						});
					});
				}

				// Start async handling
				return Promise.resolve(0)
					.then(() => {
						// Allow filtering
						if (isWatch) return;
						return context.eventEmitter.emitHook(AssetBuilderEventList.BEFORE_GIT_ADD, {context});
					})
					.then(() => {
						// Ignore if this should not be added to git
						if (context.app.disableGitAdd === true) return;

						// Add files to git
						try {
							const childProcess = require("child_process");
							childProcess.execSync("git add " + stats.outputPath, {stdio: "pipe"});
							output.push(Chalk.greenBright("The built files in " + stats.outputPath.substr(-50) + " were added to git!"));
						} catch (e) {
							output.push(Chalk.yellowBright("Failed to automagically add files in " + stats.outputPath + " to git"));
						}
					})
					.then(() => {
						// Render a footer
						output.push(this.drawLine());
						let state = numberOfWarnings === 0 && numberOfErrors === 0 ? Chalk.greenBright("OK") : "";
						if (numberOfWarnings > 0) state = Chalk.yellowBright(numberOfWarnings + " warning" + (numberOfWarnings === 1 ? "" : "s"));
						if (numberOfWarnings !== 0 && numberOfErrors !== 0) state += " | ";
						if (numberOfErrors > 0) state += Chalk.redBright(numberOfErrors + " error" + (numberOfErrors === 1 ? "" : "s"));
						output.push(new Date().toLocaleTimeString() + " | Time: " + times.join(", ") + " | " + state);
					})
					.then(() => {
						return context.eventEmitter.emitHook(AssetBuilderEventList.CALLBACK_DONE, {
							exitWorker: true,
							output,
							stats,
							exitCode,
							context
						});
					})
					.then(args => {
						// Prepare the output string
						if (isArray(args.output)) args.output = args.output.join("\r\n");
						console.log(args.output); // DON'T DELETE THIS AGAIN, PLEASE!
						return Promise.resolve(args.exitCode > 0 || args.exitWorker ? args.exitCode : -1);
					});
			});
	}

	/**
	 * Helper which draws a line for "design" purposes
	 * @param char
	 */
	protected drawLine(char?: string): string {
		char = typeof char === "string" ? char : "=";
		return char.repeat(90);
	}
}