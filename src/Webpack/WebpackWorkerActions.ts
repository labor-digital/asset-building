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
 * Last modified: 2020.10.21 at 21:29
 */

import type {Configuration} from "webpack";
import type {WorkerContext} from "../Core/WorkerContext";
import {MakeConfigurationAction, MakeConfigurationActionOptions} from "./Actions/MakeConfigurationAction";
import {MakeEnhancedConfigAction} from "./Actions/MakeEnhancedConfigAction";
import type {MakeEnhancedConfigActionOptions} from "./Actions/MakeEnhancedConfigAction.interfaces";
import {RunCompilerAction} from "./Actions/RunCompilerAction";
import type {RunCompilerOptions, RunCompilerResult} from "./Actions/RunCompilerAction.interfaces";

export class WebpackWorkerActions {

	/**
	 * The context which is used to do the actions
	 * @protected
	 */
	protected _context: WorkerContext;

	public constructor(context: WorkerContext) {
		this._context = context;
	}

	/**
	 * Allows you to run a webpack compiler based on your current worker configuration
	 * @param options
	 */
	public runCompiler(options?: RunCompilerOptions): Promise<RunCompilerResult> {
		return (new RunCompilerAction()).do(this._context, options);
	}

	/**
	 * Creates a complete webpack configuration object and and returns it, wrapped inside a promise
	 * @param options
	 */
	public makeConfiguration(options?: MakeConfigurationActionOptions): Promise<Configuration> {
		return (new MakeConfigurationAction()).do(this._context, options);
	}

	/**
	 * Allows you to enhance an existing webpack configuration object with the one build by this implementation
	 *
	 * @param baseConfig
	 * @param options
	 */
	public makeEnhancedConfig(baseConfig: Configuration, options?: MakeEnhancedConfigActionOptions): Promise<Configuration> {
		return (new MakeEnhancedConfigAction()).do(this._context, baseConfig, options);
	}
}