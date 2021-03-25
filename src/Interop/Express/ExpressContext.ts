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

import {EventBus, EventEmitter} from "@labor-digital/helferlein";
import express, {Application} from "express";
import type {Compiler} from "webpack";
import type {WorkerContext} from "../../Core/WorkerContext";
import type {ExpressAssetBuildingPluginOptions} from "./expressAssetBuildingPlugin";
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

	public constructor(expressApp: Application, options?: ExpressAssetBuildingPluginOptions) {
		options = options ?? {};
		this.isProd = process.env.NODE_ENV !== "development";
		this.type = "express";
		this.appId = options.appId ?? 0;
		this.expressApp = expressApp;
		this.packageJsonDirectory = options.packageJsonDirectory ?? process.cwd();
		options.packageJsonDirectory = this.packageJsonDirectory;
		this.eventEmitter = EventBus.getEmitter();
		this.factory = new ExpressFactory(options);
	}

	/**
	 * Helper function to register public assets using the static express middleware!
	 * @param directory The directory you want to make public, relative to the project root
	 * @param route An optional route that is used to provide the static files
	 */
	public registerPublicAssets(directory: string, route?: string) {
		const stat = express.static(directory, {
			etag: false,
			maxAge: 15 * 60 * 1000
		});
		if (typeof route === "string")
			this.expressApp.use(route, stat);
		else
			this.expressApp.use(stat);
	}
}