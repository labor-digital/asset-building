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
import {Configuration} from "webpack";
import {GeneralHelper} from "../../Helpers/GeneralHelper";
import {StorybookFactory} from "./StorybookFactory";

export const webpack = (
	webpackConfig: Configuration = {},
	options
): Promise<Configuration> => {
	GeneralHelper.renderFancyIntro();
	return (new StorybookFactory(options))
		.enhanceWebpackConfig(webpackConfig)
		.catch(err => GeneralHelper.renderError(err) as never);
};