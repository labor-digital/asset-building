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
 * Last modified: 2019.10.06 at 11:34
 */

import path from 'path';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {ConfiguratorIdentifier, LoaderIdentifier, RuleIdentifier} from '../../../Identifier';
import {CustomSassLoaderPreCompilerCacheInvalidatePlugin} from '../../Plugins/CustomSassLoaderPreCompilerCacheInvalidatePlugin';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';
import {AbstractStyleLoaderConfigurator} from './AbstractStyleLoaderConfigurator';

export class SassConfigurator extends AbstractStyleLoaderConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        // Register cache clear plugin for custom sass compiler
        context.webpackConfig.plugins.push(new CustomSassLoaderPreCompilerCacheInvalidatePlugin());
        
        await ConfigGenUtil.addRule(RuleIdentifier.SASS, context, /\.(sa|sc|c)ss$/, {
            use: await ConfigGenUtil
                .makeRuleUseChain(RuleIdentifier.SASS, context)
                .addLoader(LoaderIdentifier.STYLE_LAST, await this.makeLastLoader(context, RuleIdentifier.SASS))
                .addRaw(await this.makeLastMinuteLoaders(context, RuleIdentifier.SASS))
                .addLoader(LoaderIdentifier.CSS, {
                    loader: 'css-loader',
                    options: {
                        esModule: false,
                        import: true
                    }
                })
                .addLoader(LoaderIdentifier.POST_CSS,
                    await this.makePostcssConfig(ConfiguratorIdentifier.SASS, context))
                .addLoader(LoaderIdentifier.SASS, {
                    loader: path.resolve(context.parentContext.paths.assetBuilder,
                        './Webpack/Loaders/CustomSassLoader/CustomSassLoader.js'),
                    options: {
                        app: context.app,
                        context: () => context
                    }
                })
                .addLoader(LoaderIdentifier.STYLE_RESOURCE, {
                    loader: path.resolve(context.parentContext.paths.assetBuilder,
                        './Webpack/Loaders/ResourceLoader/ResourceLoader.js'),
                    options: {
                        currentDir: context.parentContext.paths.source,
                        entry: context.app.entry,
                        ext: ['sass', 'scss', 'css']
                    }
                })
                .finish()
        });
    }
}