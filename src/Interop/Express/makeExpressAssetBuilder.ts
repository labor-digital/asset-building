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
 * Last modified: 2019.10.15 at 09:03
 */

import type {Application} from 'express';
import {Dependencies} from '../../Core/Dependencies';
import {IncludePathRegistry} from '../../Core/IncludePathRegistry';
import type {IBuilderOptions} from '../../Core/types';
import {GeneralHelper} from '../../Helpers/GeneralHelper';
import type {ExpressContext} from './ExpressContext';

/**
 * Use this function to create an express context object that can be used by asset-builder extensions to run
 * apply build process relevant middlewares to the express app.
 *
 * @param expressApp
 * @param options
 */
export default async function makeExpressAssetBuilder(
    expressApp: Application,
    options?: IBuilderOptions
): Promise<ExpressContext> {
    GeneralHelper.renderFancyIntro();
    IncludePathRegistry.register();
    Dependencies.inheritFromOptions(options);
    
    try {
        const context: ExpressContext = new (require('./ExpressContext').ExpressContext as any)(expressApp, options);
        
        if (options && options.devServer) {
            await context.registerDevServerMiddleware();
        }
        
        return context;
    } catch (err) {
        GeneralHelper.renderError(err);
        process.exit(1);
    }
}