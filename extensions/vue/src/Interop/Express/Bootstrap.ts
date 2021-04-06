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
 * Last modified: 2020.10.22 at 13:05
 */

import type {ExpressContext, ICompilerResult, WorkerContext} from '@labor-digital/asset-building';
import {GeneralHelper} from '@labor-digital/asset-building';
import type {PlainObject} from '@labor-digital/helferlein';
import {forEach, isArray, isPlainObject, isString, isUndefined} from '@labor-digital/helferlein';
import fs from 'fs';
// @ts-ignore
import LRU from 'lru-cache';
import path from 'path';
import {BundleRenderer, BundleRendererOptions, createBundleRenderer} from 'vue-server-renderer';
import type {Configuration} from 'webpack';
import {VueEventList} from '../../types';
import {ResponseHandler} from './ResponseHandler';
import type {IExpressSsrOptions} from './types';

export class Bootstrap
{
    protected _context: ExpressContext;
    protected _responseHandler: ResponseHandler;
    protected _workerContext?: WorkerContext;
    protected _options: IExpressSsrOptions;
    protected _renderer?: BundleRenderer;
    protected _config?: Configuration;
    
    public constructor(context: ExpressContext, options?: IExpressSsrOptions)
    {
        options = options ?? {};
        options.afterRendering = options.afterRendering ?? ((o) => o);
        options.onError = options.onError ?? (() => {});
        options.beforeSend = options.beforeSend ?? (() => {});
        
        this._context = context;
        this._options = options;
        this._responseHandler = new ResponseHandler(this);
    }
    
    /**
     * Main method, that bootstraps the required contexts and registers us in the express app
     */
    public async boot(): Promise<ExpressContext>
    {
        try {
            this._workerContext = await this.initializeWorkerContext();
            this._config = await this.initializeConfiguration();
            
            // No watching for us -> Vue will do this alone
            this._workerContext.parentContext.options.watch = undefined;
            this._config.watch = undefined;
            this._workerContext.progressReporter?.update({percent: 0.5, message: 'Booting the server...'});
            
            if (this.isProd) {
                // PROD
                this._renderer = this.initializeProductionRenderer();
                this._workerContext.progressReporter?.update({percent: 1});
            } else {
                // DEV
                this.registerGlobalRendererUpdate();
                await this.startClientCompiler();
                await this._context.registerDevServerMiddleware();
            }
            
            this.registerAssetRoute();
            this.registerContentRoute();
            
            return this._context;
        } catch (err) {
            GeneralHelper.renderError(err);
            process.exit();
        }
    }
    
    /**
     * Returns the set options for the express plugin
     */
    public get options(): IExpressSsrOptions
    {
        return this._options;
    }
    
    /**
     * Returns true if we are running in production mode
     */
    public get isProd(): boolean
    {
        return this._context.isProd;
    }
    
    /**
     * Returns the worker context instance
     */
    public get workerContext(): WorkerContext
    {
        if (!this._workerContext) {
            throw new Error('In order to access the worker context, please start the "boot" method!');
        }
        return this._workerContext;
    }
    
    /**
     * Returns the list of all environment variables that will be provided to the frontend
     */
    public get environmentVariables(): PlainObject
    {
        const vars: PlainObject = {};
        if (isArray(this._options.envVars)) {
            forEach(this._options.envVars, key => {
                if (isUndefined(process.env[key])) {
                    vars[key] = null;
                } else {
                    vars[key] = process.env[key];
                }
            });
        }
        
        if (isString(process.env.PROJECT_ENV)) {
            vars.PROJECT_ENV = process.env.PROJECT_ENV;
        }
        
        // Add additional, dynamic variables if required
        if (isPlainObject(this._options.additionalEnvVars)) {
            forEach(this._options.additionalEnvVars, (v, k) => {
                vars[k] = v;
            });
        }
        
        return vars;
    }
    
    /**
     * Returns the bundle renderer instance
     */
    public get renderer(): BundleRenderer
    {
        if (isUndefined(this._renderer)) {
            throw new Error('The renderer instance was not instantiated yet!');
        }
        return this._renderer;
    }
    
    /**
     * Starts the client compiler in dev mode and waits automatically waits until all assets are up and running
     * @protected
     */
    protected startClientCompiler(): Promise<ICompilerResult>
    {
        return this.workerContext.do.runCompiler({
            config: this._config,
            ...(this.options.compilerOptions ?? {})
        });
    }
    
    /**
     * Registers the ssr renderer update handler on the global scope when running in a development environment
     * @protected
     */
    protected registerGlobalRendererUpdate(): void
    {
        let template: any = null;
        let bundle: any = null;
        let clientManifest: any = undefined;
        
        // Register global render generation
        global.EXPRESS_VUE_SSR_UPDATE_RENDERER = (type: 'template' | 'bundle' | 'clientManifest', value: string) => {
            try {
                if (type === 'template') {
                    template = value;
                    if (bundle !== null) {
                        this._renderer = this.createRenderer(bundle, template, clientManifest);
                    }
                } else if (type === 'bundle') {
                    bundle = value;
                    if (template !== null) {
                        this._renderer = this.createRenderer(bundle, template, clientManifest);
                    }
                } else if (type === 'clientManifest') {
                    clientManifest = JSON.parse(value);
                }
            } catch (e) {
                GeneralHelper.renderError(e);
            }
        };
    }
    
    /**
     * Makes sure that the worker context is initialized and ready for action
     */
    protected async initializeWorkerContext(): Promise<WorkerContext>
    {
        if (this._options.workerContext) {
            return this._options.workerContext;
        }
        
        return this._context.getWorker();
    }
    
    /**
     * Makes sure that the webpack config is ready to be used
     * @protected
     */
    protected async initializeConfiguration(): Promise<Configuration>
    {
        if (this.options.externalAllowList) {
            this.workerContext.eventEmitter.bind(
                VueEventList.SSR_EXTERNAL_ALLOW_LIST_FILTER, (e: any) => {
                    e.args.allowList = this._options.externalAllowList;
                }, -500);
        }
        
        const config = await this.workerContext.do.makeConfig();
        
        if (!isString(config.output?.path ?? false)) {
            throw new Error('The webpack config was altered! The output.path value must be a string!');
        }
        if (!isString(config.output?.publicPath ?? false)) {
            throw new Error('The webpack config was altered! The output.publicPath value must be a string!');
        }
        
        return config;
    }
    
    /**
     * Makes sure that the renderer is initialized in the production environment
     * @protected
     */
    protected initializeProductionRenderer(): BundleRenderer
    {
        const output = this._config!.output!.path!;
        const serverBundle = require(path.resolve(output, './vue-ssr-server-bundle.json'));
        const clientManifest = require(path.resolve(output, './vue-ssr-client-manifest.json'));
        const template = fs.readFileSync(path.resolve(output, './index.html'), 'utf-8');
        return this.createRenderer(serverBundle, template, clientManifest);
    }
    
    /**
     * Registers the express route to our generated assets
     * @protected
     */
    protected registerAssetRoute(): void
    {
        this._context.registerPublicAssets(
            this._config!.output!.path!,
            (this._config!.output!.publicPath! as string).replace(/^\./, ''));
    }
    
    /**
     * Registers the main catch-all express route where the bundle renderer responds to the request
     * @protected
     */
    protected registerContentRoute(): void
    {
        this._context.expressApp.get('*',
            (req, res) =>
                this._responseHandler.handle(req as any, res)
        );
    }
    
    /**
     * Internal helper to recreate the bundle renderer instance when webpack rebuilt the definition
     * @param bundle
     * @param template
     * @param clientManifest
     */
    protected createRenderer(bundle: string, template: string, clientManifest?: PlainObject)
    {
        const options: BundleRendererOptions = {
            runInNewContext: this.isProd ? 'once' : true,
            template,
            clientManifest,
            // Don't inject the styles in dev mode to prevent
            // issues (duplicate style tags) when using hot reloading
            inject: this.isProd
        };
        
        if (this.isProd) {
            options.cache = new LRU({
                max: 1000,
                maxAge: 1000 * 60 * 15
            });
        }
        
        return createBundleRenderer(bundle, options);
    }
}