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
import type {Configuration} from 'webpack';
import type {IBuilderOptions} from '../../Core/types';
import {GeneralHelper} from '../../Helpers/GeneralHelper';
import {StorybookFactory} from './StorybookFactory';

export default function makeStorybookAssetBuilder(options?: IBuilderOptions) {
    GeneralHelper.renderFancyIntro();
    const factory = new StorybookFactory(options ?? {});
    factory.initializeCoreContext();
    
    return function (webpackConfig: Configuration = {}): Promise<Configuration> {
        return factory
            .enhanceWebpackConfig(webpackConfig)
            .catch(err => GeneralHelper.renderError(err) as never);
    };
}