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
 * Last modified: 2019.02.18 at 20:58
 */

import LoaderUtils from "loader-utils";
// noinspection ES6UnusedImports
import * as webpack from "webpack";
import {AssetBuilderEventList} from "../../../../AssetBuilderEventList";
import {WorkerContext} from "../../../../Core/WorkerContext";
import {FileHelpers} from "../../../../Helpers/FileHelpers";
import LoaderContext = webpack.loader.LoaderContext;

export class SassFileResolverContext {
	public parentContext: WorkerContext;
	public loader: LoaderContext;
	public baseFile: string;
	public baseExt: string;
	public path: Array<string>;
	public validExtensions: Array<string>;

	constructor(context: WorkerContext, loader: LoaderContext) {
		this.validExtensions = ["css", "sass", "scss"];
		this.baseFile = loader.resourcePath;
		this.baseExt = FileHelpers.getFileExtension(loader.resourcePath);
		this.parentContext = context;
		this.loader = loader;
		this.path = [];
	}

	/**
	 * Initializes the context object by detecting the correct extension for the resource file
	 */
	public init(): Promise<any> {
		if (this.validExtensions.indexOf(this.baseExt) === -1) {
			const q = LoaderUtils.parseQuery(this.loader.resourceQuery);

			// Try to determine by "lang" type -> Works for vue.js
			if (typeof q.lang === "string" && this.validExtensions.indexOf(q.lang.trim().toLowerCase()) !== -1)
				this.baseExt = q.lang.trim().toLowerCase();

			// Still not? Check if we got help somewhere... /o\
			else {
				return this.parentContext.eventEmitter.emitHook(AssetBuilderEventList.SASS_LOADER_FILE_EXTENSION_FALLBACK, {
						extension: this.baseExt,
						resourceQuery: this.loader.resourceQuery,
						context: this
					})
					.then(args => {
						if (args.extension === this.baseExt)
							throw new Error("Error while creating the context for a stylesheet called: \"" + this.baseFile + "\" the file's extension does not look like it is sass compatible!");
						this.baseExt = args.extension;
					})
					.then(() => {
						// Make sure our descendants know which file this is...
						this.baseFile += "." + this.baseExt;
					});
			}

			// Make sure our descendants know which file this is...
			this.baseFile += "." + this.baseExt;
		}
		return Promise.resolve();
	}
}