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
 * Last modified: 2019.10.05 at 20:26
 */

import {isNull} from '@labor-digital/helferlein';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import type {WorkerContext} from '../../../Core/WorkerContext';
import {EventList} from '../../../EventList';
import {LoaderIdentifier, PluginIdentifier, RuleIdentifier} from '../../../Identifier';
import {ConfigGenUtil} from '../ConfigGenUtil';
import type {IConfigurator} from '../types';

export class HtmlConfigurator implements IConfigurator
{
    public async apply(context: WorkerContext): Promise<void>
    {
        // HTML LOADER
        await ConfigGenUtil.addRule(RuleIdentifier.HTML, context, /\.html$/, {
            use: await ConfigGenUtil
                .makeRuleUseChain(RuleIdentifier.HTML, context)
                .addLoader(LoaderIdentifier.HTML, {
                    loader: 'html-loader'
                })
                .finish()
        });
        
        // HTML PLUGIN
        if (!isNull(context.app.htmlTemplate)) {
            await this.configureHtmlPlugin(context);
        }
    }
    
    /**
     * Configures the html template provider plugin if activated in the app config
     * @param context
     * @protected
     */
    protected async configureHtmlPlugin(context: WorkerContext): Promise<void>
    {
        // Apply a basic configuration
        let template = context.app.htmlTemplate;
        
        if (template === true) {
            template = {};
        }
        
        if (typeof template!.template === 'undefined') {
            template!.template = path.resolve(
                path.join(__dirname, '../../../../static/HtmlDefaultTemplate.ejs')
            );
            if (typeof template!.inject === 'undefined') {
                template!.inject = false;
            }
            if (!Array.isArray(template!.meta)) {
                template!.meta = [
                    {
                        'http-equiv': 'X-UA-Compatible',
                        content: 'IE=edge,chrome=1'
                    }, {
                        name: 'viewport',
                        content: 'width=device-width, initial-scale=1.0, user-scalable=0'
                    }
                ];
            }
        }
        
        if (typeof template!.appMountId === 'undefined') {
            template!.appMountId = 'app';
        }
        
        const args = await context.eventEmitter.emitHook(EventList.FILTER_HTML_PLUGIN_TEMPLATE, {
            template, context
        });
        
        await ConfigGenUtil.addPlugin(PluginIdentifier.HTML_TEMPLATE, context, args.template,
            config => new HtmlWebpackPlugin(config));
    }
}