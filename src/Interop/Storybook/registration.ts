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
import type {PlainObject} from "@labor-digital/helferlein";
import {isPlainObject} from "@labor-digital/helferlein";
import type {Configuration} from "webpack";
import {GeneralHelper} from "../../Helpers/GeneralHelper";
import {StorybookFactory} from "./StorybookFactory";

/**
 * V2 API that resolves issues with missing, bundled node modules
 * use this in your main.js and add it like `module.exports = {webpack: makeAssetBuilder()}
 * @param options
 */
export function makeAssetBuilder(options?: PlainObject) {
	options = isPlainObject(options) ? options : {};
	GeneralHelper.renderFancyIntro();
	const factory = new StorybookFactory(options);
	factory.initializeCoreContext();

	return function (webpackConfig: Configuration = {}): Promise<Configuration> {
		return factory
			.enhanceWebpackConfig(webpackConfig)
			.catch(err => GeneralHelper.renderError(err) as never);
	};
}

/**
 * Legacy mode to support addons api of storybook
 *
 * @param webpackConfig
 * @param options
 * @deprecated
 */
export const webpack = (
	webpackConfig: Configuration = {},
	options: PlainObject
): Promise<Configuration> => {
	GeneralHelper.renderFancyIntro();
	return (new StorybookFactory(options))
		.enhanceWebpackConfig(webpackConfig)
		.catch(err => GeneralHelper.renderError(err) as never);
};