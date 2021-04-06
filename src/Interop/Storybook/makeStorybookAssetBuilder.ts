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
import path from 'path';
import type {Configuration} from 'webpack';
import {Dependencies} from '../../Core/Dependencies';
import {IncludePathRegistry} from '../../Core/IncludePathRegistry';
import type {IBuilderOptions} from '../../Core/types';
import {GeneralHelper} from '../../Helpers/GeneralHelper';
import type {StorybookFactory} from './StorybookFactory';

export default function makeStorybookAssetBuilder(options?: IBuilderOptions) {
    GeneralHelper.renderFancyIntro();
    IncludePathRegistry.register();
    
    Dependencies.setDefinitionFromPath('webpack', 'node_modules/@storybook/builder-webpack5', 'webpack');
    Dependencies.inheritFromOptions(options);
    
    // We wrap the node logger package, so it does not break our nice loading bar
    const nodeLogger = require(path.join(process.cwd(), 'node_modules/@storybook/node-logger'));
    const logWrapper = (msg: any, type: string) => {
        if (type === 'INFO' && !options?.verbose) {
            return;
        }
        if (msg !== '') {
            console.log('[' + type + ']:', msg);
        }
    };
    nodeLogger.instance.info = (m: any) => logWrapper(m, 'INFO');
    nodeLogger.instance.warn = (m: any) => logWrapper(m, 'WARN');
    nodeLogger.instance.error = (m: any) => logWrapper(m, 'ERROR');
    
    const StorybookFactory: StorybookFactory = require('./StorybookFactory').StorybookFactory;
    
    const factory: StorybookFactory = new (StorybookFactory as any)({
        ...(options ?? {})
    });
    
    return async function (webpackConfig: Configuration = {}): Promise<Configuration> {
        await factory.initializeCoreContext();
        return factory
            .enhanceWebpackConfig(webpackConfig)
            .catch(err => GeneralHelper.renderError(err) as never);
    };
}