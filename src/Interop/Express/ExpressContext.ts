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
 * Last modified: 2020.02.17 at 20:29
 */

import {EventBus, EventEmitter, isArray} from '@labor-digital/helferlein';
import type {Application} from 'express';
import type WebpackDevServer from 'webpack-dev-server';
import {Dependencies} from '../../Core/Dependencies';
import {Factory} from '../../Core/Factory';
import type {IBuilderOptions} from '../../Core/types';
import type {WorkerContext} from '../../Core/WorkerContext';
import {PluginIdentifier} from '../../Identifier';

export class ExpressContext
{
    /**
     * Defines the type of this context
     */
    public type: 'express';
    
    /**
     * The options the express plugin was initialized with
     */
    public options: IBuilderOptions;
    
    /**
     * True if express runs in production mode, false if not
     */
    public isProd: boolean;
    
    /**
     * The instance of the event emitter
     */
    public eventEmitter: EventEmitter;
    
    /**
     * The express application we should hook ourselves to
     */
    public expressApp: Application;
    
    /**
     * The factory to create contexts with
     */
    public factory: Factory;
    
    /**
     * True if the dev server middleware was registered
     * @protected
     */
    protected _devServerRegistered: boolean = false;
    
    public constructor(expressApp: Application, options?: IBuilderOptions)
    {
        this.options = options ?? {};
        this.options.environment = 'express';
        this.isProd = process.env.NODE_ENV !== 'development';
        this.type = 'express';
        this.expressApp = expressApp;
        this.eventEmitter = EventBus.getEmitter();
        this.factory = new Factory();
    }
    
    /**
     * Helper function to register public assets using the static express middleware!
     * @param directory The directory you want to make public, relative to the project root
     * @param route An optional route that is used to provide the static files
     */
    public registerPublicAssets(directory: string, route?: string): void
    {
        const stat = require('express').static(directory, {
            etag: false,
            maxAge: 15 * 60 * 1000
        });
        
        if (typeof route === 'string') {
            this.expressApp.use(route, stat);
        } else {
            this.expressApp.use(stat);
        }
    }
    
    /**
     * Creates and returns a new worker context object, to do stuff with :D
     */
    public async getWorker(): Promise<WorkerContext>
    {
        const coreContext = await this.factory.makeCoreContext({
            watch: true,
            mode: this.isProd ? 'production' : 'dev',
            ...this.options
        });
        
        if (coreContext.options.apps?.length !== 1) {
            throw new Error(
                'The express plugin can only run a single app at a time! Your "apps" options contains currently '
                + coreContext.options.apps?.length + ' apps, tho!');
        }
        
        return await this.factory.makeWorkerContext(coreContext, coreContext.options.apps![0]);
    }
    
    /**
     * Automatically registers the webpack-dev-middleware and webpack-hot-middleware in the express app.
     * Note: You should not need to do this yourself! if you set the "devServer" option to true in expressAssetBuildingPlugin,
     * this is done automatically, for you!
     */
    public async registerDevServerMiddleware(): Promise<void>
    {
        // Avoid double configuration
        if (this._devServerRegistered) {
            return;
        }
        this._devServerRegistered = true;
        
        this.options.watch = false;
        const worker = await this.getWorker();
        const config = await worker.do.makeConfig({disable: [PluginIdentifier.GIT_ADD]});
        
        worker.progressReporter?.update({percent: 0.5, message: 'Booting the server...'});
        
        if (this.isProd) {
            if (this.options.verbose) {
                console.log('Production mode enabled! Serving output directory as document root: "' +
                            config.output!.path! + '"');
            }
            this.registerPublicAssets(config.output!.path!, '/');
            worker.progressReporter?.update({percent: 1});
            return;
        }
        
        
        this.expressApp.on('listening', () => {
            worker.progressReporter?.update({percent: 1});
        });
        
        if (!isArray(config.entry)) {
            config.entry = [config.entry as any];
        }
        
        config.entry.unshift('webpack-hot-middleware/client?path=/__webpack_hmr&reload=true');
        config.plugins!.push(new Dependencies.webpack.HotModuleReplacementPlugin());
        
        const devServerOptions: WebpackDevServer.Configuration = {
            noInfo: !this.options.verbose,
            hot: true
        };
        Dependencies.devServer.addDevServerEntrypoints(config as any, devServerOptions);
        
        const compiler = await worker.do.makeCompiler({config});
        
        if (this.options.verbose) {
            console.log('Registering webpack-dev-middleware into express app!');
        }
        
        this.expressApp.use(require('webpack-dev-middleware')(compiler, {
            stats: false,
            publicPath: (compiler.options.output.publicPath! as string).replace(/^\./, ''),
            headers: {
                etag: null,
                'cache-control': 'no-cache,no-store',
                'Pragma': 'no-cache'
            }
        }));
        
        this.expressApp.use(require('webpack-hot-middleware')(compiler, {
            path: '/__webpack_hmr',
            heartbeat: 10 * 1000
        }));
    }
}