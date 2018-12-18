#!/usr/bin/env node
/**
 * Created by Martin Neundorfer on 09.08.2018.
 * For LABOR.digital
 */
const webpack = require("webpack");
const pjson = require("../package.json");
const Dir = require("./Entities/Dir");
const MiscFixes = require("./Bugfixes/MiscFixes");
const MiscHelpers = require("./Helpers/MiscHelpers");
const ContextFactory = require("./ContextFactory");
const WebpackConfigBuilder = require("./WebpackConfigBuilder");

// Do our fancy intro
MiscHelpers.fancyIntro(pjson.version);

// Get directory representation
const dir = new Dir(process.cwd(), __dirname);

// Apply fixes
MiscFixes.eventsJsUncaughtErrorFix();
MiscFixes.resolveFilenameFix(dir);

try {
	// Build our configuration
	const context = ContextFactory.createContext(dir);
	WebpackConfigBuilder.createConfig(context);

	// Call filters
	context.callPluginMethod("filterContextBeforeCompiler", [context]);

	// Start webpack
	const callback = (err, stats) => context.callback(context, err, stats);
	const useDefaultCompiler = context.callPluginMethod("alternativeCompiler", [true, webpack, callback, context]);
	if(useDefaultCompiler) webpack(context.webpackConfig, callback);
} catch (e) {
	MiscHelpers.kill(e.stack);
}
