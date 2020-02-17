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
 * Last modified: 2019.10.05 at 18:28
 */
import {EventEmitter} from "@labor-digital/helferlein/lib/Events/EventEmitter";
import {PlainObject} from "@labor-digital/helferlein/lib/Interfaces/PlainObject";
import {Configuration} from "webpack";
import {ExtensionLoader} from "../Extension/ExtensionLoader";
import {AppDefinitionInterface} from "../Interfaces/AppDefinitionInterface";
import {WebpackCompilerCallbackInterface} from "../Interfaces/WebpackCompilerCallbackInterface";
import {DefaultCompilerCallback} from "../Webpack/DefaultCompilerCallback";
import {CoreContext} from "./CoreContext";

export class WorkerContext {
	/**
	 * Defines the type of this context
	 */
	public type: "worker";

	/**
	 * Holds the current app definition
	 */
	public app: AppDefinitionInterface;

	/**
	 * Contains the webpack configuration we are currently working on
	 */
	public webpackConfig: Configuration | PlainObject;

	/**
	 * The callback for the webpack compiler
	 */
	public webpackCallback: WebpackCompilerCallbackInterface;

	/**
	 * The core context object that is used for this context object
	 */
	public parentContext: CoreContext;

	/**
	 * Injects the basic configuration
	 * @param parentContext
	 * @param app
	 */
	constructor(parentContext: CoreContext, app: AppDefinitionInterface) {
		this.type = "worker";
		this.parentContext = parentContext;
		this.app = app;
		this.webpackConfig = {};
		this.webpackCallback = function () {
			// @ts-ignore
			return (new DefaultCompilerCallback()).handle(...arguments);
		};
	}

	/**
	 * The event bus instance we use in this context
	 */
	public get eventEmitter(): EventEmitter {
		return this.parentContext.eventEmitter;
	}

	/**
	 * The extension loader instance
	 */
	public get extensionLoader(): ExtensionLoader {
		return this.parentContext.extensionLoader;
	}

	/**
	 * The version number of the current config builder
	 */
	public get builderVersion(): number {
		return this.parentContext.builderVersion;
	}

	/**
	 * The numeric zero-based index of the app which is currently configured.
	 */
	public get appId(): number {
		return this.app.id;
	}

	/**
	 * True if this app should be executed as webpack's "production" mode
	 */
	public get isProd(): boolean {
		return this.parentContext.isProd;
	}

	/**
	 * The mode key which was given as cli parameter
	 */
	public get mode(): string {
		return this.parentContext.mode;
	}
}
