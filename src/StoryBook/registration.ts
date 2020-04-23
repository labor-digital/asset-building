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
 * Last modified: 2020.04.23 at 20:03
 */
import {isPlainObject} from "@labor-digital/helferlein/lib/Types/isPlainObject";
import {Configuration} from "webpack";
import {StoryBookFactory} from "./StoryBookFactory"; // eslint-disable-line import/no-extraneous-dependencies

export const webpack = (
	webpackConfig: Configuration = {},
	options
): Promise<Configuration> => {
	const factory = new StoryBookFactory(isPlainObject(options.app) ? options.app : {});
	return factory.enhanceWebpackConfig(webpackConfig);
};