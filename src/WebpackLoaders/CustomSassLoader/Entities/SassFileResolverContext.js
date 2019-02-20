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
 * Last modified: 2019.02.05 at 17:43
 */

/**
 * Created by Martin Neundorfer on 05.02.2019.
 * For LABOR.digital
 */
const BaseFileExtResolver = require("../BaseFileExtResolver");

module.exports = class SassFileResolverContext {
	/**
	 * @param {module.ConfigBuilderContext} baseContext
	 * @param loaderContext
	 */
	constructor(baseContext, loaderContext) {
		this.baseFile = loaderContext.resourcePath;
		this.baseContext = baseContext;
		this.loader = loaderContext;
		this.baseExt = "";
		this.path = [];
		BaseFileExtResolver.getExtFor(this);
	}
};