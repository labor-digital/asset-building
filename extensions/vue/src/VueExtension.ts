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
 * Last modified: 2021.03.29 at 21:28
 */

import {
    AbstractExtension,
    ConfigGenUtil,
    EventList,
    LoaderIdentifier,
    PluginIdentifier
} from '@labor-digital/asset-building';
import {cloneList, isNull, isUndefined, md5, merge as mergeList} from '@labor-digital/helferlein';
import path from 'path';
import {VueLoaderPlugin} from 'vue-loader';
import {merge} from 'webpack-merge';
import {ClientRendererProviderPlugin} from './Interop/Express/Plugin/ClientRendererProviderPlugin';
import {ServerRendererProviderPlugin} from './Interop/Express/Plugin/ServerRendererProviderPlugin';
import type {IVueAppDefinition} from './types';
import {VueEventList} from './types';

export class VueExtension extends AbstractExtension
{
    protected _externalAllowList: RegExp = /\.css$|\.vue$|[\\\/]src[\\\/]|[\\\/]source[\\\/]/;
    
    public async initialize(): Promise<void>
    {
        this.setConfig({
            allowGlobalRegistration: false
        });
        
        this.collectNodeExternals();
        
        this.extendAppSchema();
        this.extendTypescript();
        this.extendPolyfills();
        this.extendCleanOutputConfig();
        this.extendStyles();
        this.extendHtmlTemplate();
        this.addVueLoader();
        
        this.configureForSsr();
        
        return Promise.resolve(undefined);
    }
    
    protected collectNodeExternals(): void
    {
        this.addListener(EventList.AFTER_WORKER_INIT_DONE, async () => {
            const args = await this.eventEmitter.emitHook(VueEventList.SSR_EXTERNAL_ALLOW_LIST_FILTER,
                {allowList: this._externalAllowList});
            this._externalAllowList = args.allowList;
        });
    }
    
    protected extendAppSchema(): void
    {
        this.addListener(EventList.FILTER_APP_DEFINITION_SCHEMA, e => {
            e.args.schema = {
                ...e.args.schema,
                useCssExtractPlugin: {
                    type: ['undefined', 'true'],
                    default: undefined
                },
                useSsr: {
                    type: 'bool',
                    default: false
                },
                useSsrServerExternals: {
                    type: 'bool',
                    default: false
                },
                ssrWorker: {
                    type: 'string',
                    values: ['client', 'server'],
                    default: 'client'
                }
            };
        });
    }
    
    protected extendTypescript(): void
    {
        this.addListener(EventList.FILTER_LOADER_CONFIG, e => {
            if (e.args.identifier === LoaderIdentifier.TS) {
                const options = e.args.config.options.compilerOptions ?? {};
                options.jsxFactory = 'h';
                e.args.config.options.compilerOptions = options;
            }
        });
    }
    
    protected extendPolyfills(): void
    {
        this.addListener(EventList.FILTER_POLYFILLS, e => {
            e.args.polyfills.push('core-js/features/array/includes.js');
        });
    }
    
    protected extendCleanOutputConfig(): void
    {
        this.addListener(EventList.FILTER_PLUGIN_CONFIG, e => {
            if (e.args.identifier === PluginIdentifier.CLEAN_OUTPUT_DIR) {
                e.args.config.cleanOnceBeforeBuildPatterns.push('!vue-ssr-server-bundle.json');
            }
        });
    }
    
    protected extendStyles(): void
    {
        // Make sure the styles get minified when we are using server side rendering in production mode
        if (this.doSsr && this.coreContext.isProd) {
            this.addListener(EventList.FILTER_POSTCSS_PLUGINS, e => {
                e.args.plugins.push(require('cssnano'));
            });
        }
        
        // Make sure we don't run into issues when using the css extract plugin with vue modules
        this.addListener(EventList.FILTER_PLUGIN_CONFIG, e => {
            if (e.args.identifier === PluginIdentifier.CSS_EXTRACT) {
                e.args.config.ignoreOrder = true;
            }
        });
        
        // Register additional loader to strip out all /deep/ selectors we need for component nesting,
        // but that are not wanted in a browser environment
        this.addListener(EventList.FILTER_LAST_MINUTE_STYLE_LOADERS, e => {
            e.args.loaders.push(path.resolve(
                this.coreContext.paths.assetBuilder,
                'Webpack/Loaders/DeepRemover/DeepRemoverLoader.js'
            ));
        });
        
        // Inject the vue style loader, instead of the mini-css-extract-plugin
        // If we are in production mode and we don't use the server
        // side renderer we will not inject the vue style loader
        if ((this.doSsr || !this.coreContext.isProd) && !this.app.useCssExtractPlugin) {
            this.addListener(EventList.FILTER_LAST_STYLE_LOADER, e => {
                e.args.loader = 'vue-style-loader';
            });
        }
        
        // Update css-loader options
        // @see https://github.com/vuejs/vue-style-loader/issues/46#issuecomment-670624576
        this.addListener(EventList.FILTER_LOADER_CONFIG, e => {
            if (e.args.identifier === LoaderIdentifier.CSS) {
                const options = e.args.config.options ?? {};
                options.esModule = false;
                e.args.config.options = options;
            }
        });
    }
    
    protected extendHtmlTemplate(): void
    {
        // Make sure the html template is enabled in ssr mode, or the dev server
        if (this.doSsr || this.coreContext.options.devServer) {
            this.addListener(EventList.AFTER_WORKER_INIT_DONE, e => {
                if (isUndefined(e.args.context.app.htmlTemplate) || isNull(e.args.context.app.htmlTemplate)) {
                    e.args.context.app.htmlTemplate = true;
                }
            });
        }
        
        // Use our specially, handcrafted template for SSR
        if (this.doSsr) {
            this.addListener(EventList.FILTER_HTML_PLUGIN_TEMPLATE, e => {
                e.args.template.template = path.join(__dirname, '../indexTemplate/index.ejs');
                e.args.template.minify = false;
                e.args.template.inject = false;
            });
        }
    }
    
    protected addVueLoader()
    {
        this.addListener(EventList.APPLY_EXTENSION_WEBPACK_CONFIG, async (e) => {
            
            // Add vue loader
            // We use "true" as fifth parameter, so that vue-loader is in the list before "html-loader"
            // this fixes this issue: https://github.com/vuejs/vue-loader/issues/1625.
            // If the bug is fixed, we could revert to the default behaviour
            await ConfigGenUtil.addRule('rule:vue', e.args.context, /\.vue$/, {
                use: await ConfigGenUtil
                    .makeRuleUseChain('rule:vue', e.args.context)
                    .addLoader('loader:vue', {
                        loader: 'vue-loader',
                        options: {
                            cacheBusting: true,
                            transformToRequire: {
                                video: ['src', 'poster'],
                                source: 'src',
                                img: 'src',
                                image: 'xlink:href'
                            }
                        }
                    })
                    .finish()
            }, true);
            
            // Add vue to the list of resolvable extensions
            e.args.context.webpackConfig = merge(e.args.context.webpackConfig, {
                resolve: {
                    extensions: ['.vue', '.tsx']
                }
            });
            
            // Add vue plugin
            // @ts-ignore
            await ConfigGenUtil.addPlugin('plugin:vue:loader', e.args.context, {}, c => new VueLoaderPlugin(c));
        });
        
    }
    
    protected configureForSsr(): void
    {
        if (!this.doSsr) {
            return;
        }
        
        this.addListener(EventList.APPLY_EXTENSION_WEBPACK_CONFIG, async () => {
            // Extend the webpack configuration to handle vue ssr
            if (this.app.ssrWorker === 'server') {
                await this.extendSsrServerConfig();
            } else {
                await this.extendSsrClientConfig();
            }
        }, 1000);
        
        this.addListener(EventList.AFTER_WORKER_INIT_DONE, async () => {
            // Split off the server configuration into a separate worker process
            if (this.app.ssrWorker === 'client') {
                await this.launchSsrServerWorker();
            }
        });
    }
    
    protected makeSsrServerApp(): IVueAppDefinition
    {
        return mergeList(
            cloneList(this.app),
            {
                appName: this.app.appName + ' - Server Generator',
                id: (this.app.id ?? 0) + 1000,
                minChunkSize: 999999999,
                polyfills: false,
                keepOutputDirectory: true,
                disableGitAdd: true,
                ssrWorker: 'server'
            } as IVueAppDefinition
        ) as any;
    }
    
    protected launchSsrServerWorker(): Promise<void>
    {
        return this.coreContext.processManager.startSingleWorker(
            this.makeSsrServerApp(), {
                onCreate: (process) => {
                    process.on('message', (message: any) => {
                        if (typeof message.VUE_SSR_BUNDLE === 'undefined'
                            || typeof global.EXPRESS_VUE_SSR_UPDATE_RENDERER === 'undefined') {
                            return;
                        }
                        global.EXPRESS_VUE_SSR_UPDATE_RENDERER('bundle', message.VUE_SSR_BUNDLE);
                    });
                    
                    return Promise.resolve(process);
                }
            }).catch(
            (err: Error | string) => {
                if (typeof err === 'string') {
                    throw new Error(err);
                }
                
                throw err;
            });
    }
    
    protected async extendSsrServerConfig(): Promise<void>
    {
        this.workerContext!.webpackConfig = merge(this.workerContext!.webpackConfig, {
            // This allows webpack to handle dynamic imports in a Node-appropriate
            // fashion, and also tells `vue-loader` to emit server-oriented code when
            // compiling Vue components.
            target: 'node',
            
            // For bundle renderer source map support
            devtool: 'source-map',
            
            // This tells the server bundle to use Node-style exports
            output: {
                libraryTarget: 'commonjs2'
            },
            
            // https://webpack.js.org/configuration/externals/#function
            // https://github.com/liady/webpack-node-externals
            // Externalize app dependencies. This makes the server build much faster
            // and generates a smaller bundle file.
            externals: ((require('webpack-node-externals'))({
                // do not externalize dependencies that need to be processed by webpack.
                // you can add more file types here e.g. raw *.vue files
                // you should also allow deps that modifies `global` (e.g. polyfills)
                allowlist: this._externalAllowList
            }))
        });
        
        // This is the plugin that turns the entire output of the server build
        // into a single JSON file. The default file name will be
        // `vue-ssr-server-bundle.json`
        await ConfigGenUtil.addPlugin('vue:server:server', this.workerContext!, {},
            c => new (require('vue-server-renderer/server-plugin'))(c));
        
        // Define some useful environment variables
        await ConfigGenUtil.addPlugin('vue:server:define', this.workerContext!, {
                'process.env.NODE_ENV': JSON.stringify(
                    process.env.NODE_ENV === 'production' || this.coreContext.isProd ? 'production' : 'development'),
                'process.env.VUE_ENV': '"server"'
            },
            c => new (require('webpack')).DefinePlugin(c));
        
        // Add hook to listen for the server bundle
        if (this.coreContext.environment === 'express') {
            await ConfigGenUtil.addPlugin('vue:server:expressProvider', this.workerContext!, {},
                () => new ServerRendererProviderPlugin());
        }
    }
    
    protected async extendSsrClientConfig(): Promise<void>
    {
        // Important: this splits the webpack runtime into a leading chunk
        // so that async chunks can be injected right after it.
        // this also enables better caching for your app/vendor code.
        await ConfigGenUtil.addPlugin('vue:server:splitChunks', this.workerContext!, {
            name: 'manifest',
            minChunks: Infinity
        }, c => new (require('webpack')).optimize.SplitChunksPlugin(c));
        
        // This plugins generates `vue-ssr-client-manifest.json` in the
        // output directory.
        await ConfigGenUtil.addPlugin('vue:client:client', this.workerContext!, {},
            c => new (require('vue-server-renderer/client-plugin'))(c));
        
        // Define some useful environment variables
        await ConfigGenUtil.addPlugin('vue:client:define', this.workerContext!, {
                'process.env.NODE_ENV': JSON.stringify(
                    process.env.NODE_ENV === 'production' || this.coreContext.isProd ? 'production' : 'development'),
                'process.env.VUE_ENV': '"client"'
            },
            c => new (require('webpack')).DefinePlugin(c));
        
        // Add hook to listen for the server bundle
        if (this.coreContext.environment === 'express') {
            await ConfigGenUtil.addPlugin('vue:client:expressProvider', this.workerContext!, {},
                () => new ClientRendererProviderPlugin());
        }
        
        // Rewrite output file
        const hash = md5((new Date()).toTimeString() + '-' + Math.random() + Math.random());
        this.workerContext!.webpackConfig.output.filename =
            this.workerContext!.webpackConfig.output.filename.replace(/(.*?)\.([^.]*?)/g, '$1-' + hash + '.$2');
    }
    
    /**
     * Returns the app configuration object
     * @protected
     */
    protected get app(): IVueAppDefinition
    {
        return this.workerContext!.app as any;
    }
    
    /**
     * Returns true if SSR is enabled
     * @protected
     */
    protected get doSsr(): boolean
    {
        return this.app.useSsr || global.EXPRESS_VUE_SSR_MODE;
    }
}