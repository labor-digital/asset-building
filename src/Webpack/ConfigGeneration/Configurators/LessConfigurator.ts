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
 * Last modified: 2019.10.05 at 21:39
 */

import path from 'path';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {ConfiguratorIdentifier, LoaderIdentifier, RuleIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';
import {AbstractStyleLoaderConfigurator} from './AbstractStyleLoaderConfigurator';

export class LessConfigurator extends AbstractStyleLoaderConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        await ConfigGenUtil.addRule(RuleIdentifier.LESS, context, /\.less$/, {
            use: await ConfigGenUtil
                .makeRuleUseChain(RuleIdentifier.LESS, context)
                .addLoader(LoaderIdentifier.STYLE_LAST, await this.makeLastLoader(context, RuleIdentifier.LESS))
                .addRaw(await this.makeLastMinuteLoaders(context, RuleIdentifier.LESS))
                .addLoader(LoaderIdentifier.CSS, {loader: 'css-loader'})
                .addLoader(LoaderIdentifier.POST_CSS,
                    await this.makePostcssConfig(ConfiguratorIdentifier.LESS, context))
                .addLoader(LoaderIdentifier.LESS, {loader: 'less-loader'})
                .addLoader(LoaderIdentifier.STYLE_RESOURCE, {
                    loader: path.resolve(context.parentContext.paths.assetBuilder,
                        './Webpack/Loaders/ResourceLoader/ResourceLoader.js'),
                    options: {
                        currentDir: context.parentContext.paths.source,
                        entry: context.app.entry,
                        ext: ['less', 'css']
                    }
                })
                .finish()
        });
    }
}