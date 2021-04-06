/*
 * Copyright 2021 LABOR.digital
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
 * Last modified: 2021.03.30 at 01:25
 */

import type {ICompilerOptions, WorkerContext} from '@labor-digital/asset-building';
import type {PlainObject} from '@labor-digital/helferlein';
import type {Response} from 'express';

export interface IAfterRenderingHook
{
    (output: string, vueContext: PlainObject, res: Response, req: Request): string
}

export interface IBeforeSendHook
{
    (res: Response, req: Request, vueContext: PlainObject): void
}

export interface IOnErrorHook
{
    (err: Error, res: Response, req: Request, vueContext: PlainObject): void
}

export interface IExpressSsrVueContextFilter
{
    (context: PlainObject): void
}

export interface IExpressSsrOptions
{
    /**
     * A list of environment variables that should be made public to both your SSR and your browser context
     * Please make sure that you don't make critical secrets public! You can access the variables on window.VUE_ENV in the
     * frontend and on vueContext.VUE_ENV in your SSR app's context
     */
    envVars?: Array<string>
    
    /**
     * A list of key value pairs that will be automatically injected into the object at process.vueSsrEnv.
     * They will be available in your browser app and your ssr context, so be careful!
     */
    additionalEnvVars?: PlainObject<string | number>
    
    /**
     * Can be used to modify the vue context object before it is passed to the bundle renderer
     */
    vueContextFilter?: IExpressSsrVueContextFilter
    
    /**
     * Allows you to register late filtering, for the rendered output
     */
    afterRendering?: IAfterRenderingHook
    
    /**
     * Allows you to register VERY-LATE filtering, for the response object
     */
    beforeSend?: IBeforeSendHook
    
    /**
     * Allows you to listen for errors while rendering the vue application
     */
    onError?: IOnErrorHook
    
    /**
     * Allows you to define the regex that is used to define
     * node_module files that can be build by webpack, everything else is directly loaded
     * from the node_modules directory on your server.
     *
     * Default: /\.css$|\.vue$|[\\\/]src[\\\/]|[\\\/]source[\\\/]/
     */
    externalAllowList?: RegExp
    
    /**
     * Allows you to inject a custom worker context object
     */
    workerContext?: WorkerContext
    
    /**
     * Passes the given options to worker.do.makeCompiler when the dev-compiler is created
     */
    compilerOptions?: ICompilerOptions
}