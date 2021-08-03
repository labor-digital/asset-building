/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.02.17 at 20:29
 */

import {EventBus} from "@labor-digital/helferlein/lib/Events/EventBus";
import {EventEmitter} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {Application} from "express";
import expressStaticGzip from "express-static-gzip";
import {Compiler} from "webpack";
import {WorkerContext} from "../../Core/WorkerContext";
import {IExpressRegisterPublicAssetsOptions} from "../../Express/types";
import ExpressFactory from "./ExpressFactory";

export default class ExpressContext {
	/**
	 * Defines the type of this context
	 */
	public type: "express";

	/**
	 * The app id we should build for this context
	 */
	public appId: number;

	/**
	 * True if express runs in production mode, false if not
	 */
	public isProd: boolean;

	/**
	 * The cwd which point's to the package.json directory
	 */
	public packageJsonDirectory: string;

	/**
	 * The instance of the event emitter
	 */
	public eventEmitter: EventEmitter;

	/**
	 * The express application we should hook ourselves to
	 */
	public expressApp: Application;

	/**
	 * The factory to create the parts of the asset builder in an express context
	 */
	public factory: ExpressFactory;

	/**
	 * If the server does run in development mode this will contain the worker process
	 * of the main app we should build
	 */
	public parentContext?: WorkerContext;

	/**
	 * If the server does run in development mode this will contain the webpack compiler
	 * of the main app we should build
	 */
	public compiler?: Compiler;

	public constructor(appId: number, expressApp: Application, isProd: boolean, packageJsonDirectory: string) {
		this.type = "express";
		this.appId = appId;
		this.expressApp = expressApp;
		this.isProd = isProd;
		this.packageJsonDirectory = packageJsonDirectory;
		this.eventEmitter = EventBus.getEmitter();
	}

	/**
	 * Helper function to register public assets using the static express middleware!
	 * @param directory The directory you want to make public, relative to the project root
	 * @param route An optional route that is used to provide the static files
	 * @param options Optional options for the registered middleware
	 */
	public registerPublicAssets(directory: string, route?: string, options?: IExpressRegisterPublicAssetsOptions) {
		options = options ?? {};
		const stat = expressStaticGzip(directory, {
			enableBrotli: true,
			serveStatic: {
				etag: false,
				maxAge: 15 * 60 * 1000,
				...options.static
			},
			...options.compression
		});
		if (typeof route === "string")
			this.expressApp.use(route, stat);
		else
			this.expressApp.use(stat);
	}
}