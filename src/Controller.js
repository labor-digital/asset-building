#!/usr/bin/env node
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
 * Last modified: 2018.12.20 at 18:21
 */
const webpack = require("webpack");
const pjson = require("../package.json");
const Dir = require("./Entities/Dir");
const MiscFixes = require("./Bugfixes/MiscFixes");
const MiscHelpers = require("./Helpers/MiscHelpers");
const ContextFactory = require("./ContextFactory");
const WebpackConfigBuilder = require("./WebpackConfigBuilder");
const SvgFontHeightFix = require("./Bugfixes/SvgFontHeightFix");

// Do our fancy intro
MiscHelpers.fancyIntro(pjson.version);

// Get directory representation
const dir = new Dir(process.cwd(), __dirname);

// Apply fixes
MiscFixes.eventsJsUncaughtErrorFix();
MiscFixes.resolveFilenameFix(dir);
SvgFontHeightFix();

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
