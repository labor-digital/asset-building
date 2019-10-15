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

import {isUndefined} from "@labor/helferlein/lib/Types/isUndefined";
import {Application} from "express";
import ExpressContext from "./ExpressContext";
import ExpressFactory from "./ExpressFactory";

/**
 * Use this function to create an express context object that can be used by asset-builder extensions to run
 * apply build process relevant middlewares to the express app.
 *
 * @param expressApp
 * @param appId
 * @param packageJsonDirectory
 */
module.exports = function expressAssetBuildingPlugin(expressApp: Application, appId?: number, packageJsonDirectory?: string): Promise<ExpressContext> {
	const isProd = process.env.NODE_ENV !== "development";
	if (isUndefined(appId)) appId = 0;
	if (isUndefined(packageJsonDirectory)) packageJsonDirectory = process.cwd();
	const context = new ExpressContext(appId, expressApp, isProd, packageJsonDirectory);
	context.factory = new ExpressFactory(packageJsonDirectory);

	// Be done if we are in production context
	if (isProd) return Promise.resolve(context);

	// Create the worker process
	return context.factory.getWebpackCompiler(appId).then(compiler => {
		context.compiler = compiler;
		context.parentContext = (compiler as any).assetBuilderContext;
		return context;
	});
};