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
 * Last modified: 2020.10.22 at 13:32
 */

import type {PlainObject} from '@labor-digital/helferlein';
import {isFunction, isString} from '@labor-digital/helferlein';
import type {Response} from 'express';
import type {BundleRenderer} from 'vue-server-renderer';
import type {Bootstrap} from './Bootstrap';

export class ResponseHandler
{
    protected _bootstrap: Bootstrap;
    
    public constructor(bootstrap: Bootstrap)
    {
        this._bootstrap = bootstrap;
    }
    
    /**
     * Handles the ssr request using the vue bundle renderer
     * @param req
     * @param res
     */
    public async handle(req: Request, res: Response): Promise<void>
    {
        if (!this.hasRenderer) {
            return res.end('Waiting for compilation... Refresh in a moment.');
        }
        
        const s = Date.now();
        res.setHeader('Content-Type', 'text/html');
        
        const options = this._bootstrap.options ?? {};
        
        // Create the rendering stream
        const vueContext = {
            url: req.url,
            serverRequest: req,
            serverResponse: res,
            env: this._bootstrap.environmentVariables,
            afterRendering: ((() => {}) as any)
        };
        
        if (isFunction(options.vueContextFilter)) {
            options.vueContextFilter(vueContext);
        }
        
        try {
            let result = await this.renderer.renderToString(vueContext);
            
            if (isFunction(options.afterRendering)) {
                const tmp = await options.afterRendering(result, vueContext, res, req);
                if (isString(tmp)) {
                    result = tmp;
                }
            }
            
            result = this.applyMetaData(vueContext, result);
            result = this.applyRendererMetaData(vueContext, result);
            
            // @todo a filter of result would be nice here.
            // Both from the app and the plugin options?
            res.write(result);
            
            if (isFunction(vueContext.afterRendering)) {
                await vueContext.afterRendering(res, req, vueContext);
            }
            
            if (isFunction(options.beforeSend)) {
                await options.beforeSend(res, req, vueContext);
            }
            
            if (this._bootstrap.workerContext.parentContext.options.verbose) {
                console.log(`Request duration: ${Date.now() - s}ms`);
            }
            
            res.end();
            
        } catch (e) {
            res.status(500).end('500 | Internal Server Error');
            
            if (isFunction(options.onError)) {
                options.onError(e, res, req, vueContext);
            }
            
            if (this._bootstrap.isProd && !this._bootstrap.workerContext.parentContext.options.verbose) {
                // Make the error conform to log collectors
                console.error(`Error during render : ${req.url} | ${e}`.replace(/[\r\n]/g, ' -> '));
            } else {
                console.log(`Request duration: ${Date.now() - s}ms`);
                console.error(`Error during render : ${req.url}`);
                console.error(e);
            }
        }
    }
    
    /**
     * Returns true if the bundle renderer is initialized, false if not
     * @protected
     */
    protected get hasRenderer(): boolean
    {
        try {
            this._bootstrap.renderer;
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Returns the vue bundle renderer instance
     * @protected
     */
    protected get renderer(): BundleRenderer
    {
        return this._bootstrap.renderer;
    }
    
    /**
     * Internal helper to inject only the scripts and the state into the build chunks.
     * This avoids issues when the hot reload plugin and the bundle renderer start to fight over
     * the priority of css rules.
     *
     * @param vueContext
     * @param chunk
     */
    protected applyRendererMetaData(vueContext: PlainObject, chunk: string): string
    {
        const that = this;
        chunk = chunk.replace(/<!--vue-renderer-head-outlet-->/g, function () {
            if (that._bootstrap.isProd) {
                return '';
            }
            
            let result = '';
            
            if (isFunction(vueContext.renderScripts)) {
                result += vueContext.renderScripts() + ' ';
            }
            
            if (isFunction(vueContext.renderState)) {
                result += vueContext.renderState() + ' ';
            }
            
            return result;
        });
        return chunk;
    }
    
    /**
     * Internal helper to apply the vue-meta properties into our template
     * @see https://vue-meta.nuxtjs.org/guide/ssr.html#inject-metadata-into-page-stream
     * @param vueContext
     * @param output
     */
    protected applyMetaData(vueContext: PlainObject, output: string): string
    {
        const nl = '\r\n';
        
        // Inject the environment variables
        const jsonEnv = JSON.stringify(vueContext.env);
        const envScript = '<script type=\'text/javascript\'>window.VUE_ENV = ' + jsonEnv + ';</script>';
        output = output.replace(/<!--vue-head-outlet-->/g, () => '<!--vue-head-outlet-->' + nl + envScript);
        
        // Check if we should inject additional metadata
        if (typeof vueContext.meta === 'undefined') {
            return output;
        }
        
        const {
            title, htmlAttrs, headAttrs, bodyAttrs, link,
            style, script, noscript, meta
        } = vueContext.meta.inject();
        
        // Build the placeholders
        output = output.replace(/data-vue-template-html/g, () => 'data-vue-meta-server-rendered ' + htmlAttrs.text());
        output = output.replace(/data-vue-template-head/g, headAttrs.text());
        output = output.replace(/<!--vue-head-outlet-->/g, () => meta.text() + nl + title.text() + nl + link.text() + nl
                                                                 + style.text() + nl + script.text() + nl +
                                                                 noscript.text());
        output = output.replace(/data-vue-template-body/g, () => bodyAttrs.text());
        output = output.replace(/<!--vue-pbody-outlet-->/g,
            () => style.text({pbody: true}) + nl + script.text({pbody: true}) + noscript.text({pbody: true}));
        output = output.replace(/<!--vue-body-outlet-->/g,
            () => style.text({body: true}) + nl + script.text({body: true}) + noscript.text({body: true}));
        
        // Done
        return output;
    }
}