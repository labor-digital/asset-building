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
 * Last modified: 2019.10.15 at 09:03
 */

import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {isUndefined} from "@labor-digital/helferlein/lib/Types/isUndefined";
import {Application} from "express";
import {GeneralHelper} from "../../Helpers/GeneralHelper";
import ExpressContext from "./ExpressContext";
import ExpressFactory from "./ExpressFactory";

export interface ExpressAssetBuildingPluginOptions {
	/**
	 * The numeric index of the "apps" array in the package.json we should build.
	 */
	appId?: number;

	/**
	 * The path to the package json to read the "labor" config from
	 */
	packageJsonDirectory?: string;

	/**
	 * The mode to run the asset builder in.
	 * This would normally be defined using the CLI parameters
	 */
	mode?: string;
}

/**
 * Use this function to create an express context object that can be used by asset-builder extensions to run
 * apply build process relevant middlewares to the express app.
 *
 * @param expressApp
 * @param options
 */
module.exports = function expressAssetBuildingPlugin(expressApp: Application, options?: ExpressAssetBuildingPluginOptions): Promise<ExpressContext> {
	GeneralHelper.renderFancyIntro();

	const isProd = process.env.NODE_ENV !== "development";

	if (!isPlainObject(options)) options = {};
	if (isUndefined(options.mode)) options.mode = "build";
	if (isUndefined(options.appId)) options.appId = 0;
	if (isUndefined(options.packageJsonDirectory)) options.packageJsonDirectory = process.cwd();
	
	const context = new ExpressContext(options.appId, expressApp, isProd, options.packageJsonDirectory);
	context.factory = new ExpressFactory(options);

	// Be done if we are in production context
	if (isProd) {
		return Promise.resolve(context);
	}

	// Create the worker process
	return context.factory.getWorkerContext()
		.then(context => context.do.runCompiler())
		.then(res => {
			context.compiler = res.compiler;
			context.parentContext = res.context;
			return context;
		});
};