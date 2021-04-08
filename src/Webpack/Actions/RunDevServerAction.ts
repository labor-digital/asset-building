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
 * Last modified: 2021.03.26 at 15:03
 */

import {isArray, isPlainObject, isString} from '@labor-digital/helferlein';
import Chalk from 'chalk';
import * as fs from 'fs';
import {createServer, Server} from 'http';
import portfinder from 'portfinder';
import type WebpackDevServer from 'webpack-dev-server';
import {Dependencies} from '../../Core/Dependencies';
import type {WorkerContext} from '../../Core/WorkerContext';
import {EventList} from '../../EventList';
import {PluginIdentifier} from '../../Identifier';
import type {IRunDevServerOptions, IWorkerAction} from './types';

export class RunDevServerAction implements IWorkerAction
{
    public async do(context: WorkerContext, options?: IRunDevServerOptions): Promise<WebpackDevServer>
    {
        const config = await context.do.makeConfig({
            disable: [
                PluginIdentifier.GIT_ADD,
                ...options?.compiler?.makeConfigOptions?.disable ?? []
            ]
        });
        
        const {port, host, tempServer} = await this.resolvePort(context);
        
        if (!isArray(config.entry)) {
            config.entry = [config.entry as any];
        }
        
        config.entry.unshift('webpack-dev-server/client?https://' + host + ':' + port);
        
        const enforceLeadingSlash = function (publicPath?: string): string | undefined {
            if (isString(publicPath) && publicPath.charAt(0) !== '/') {
                publicPath = '/' + publicPath;
            }
            return publicPath;
        };
        let publicPath = enforceLeadingSlash(context.webpackConfig.output.publicPath ?? undefined);
        
        if (context.app.devServer && context.app.devServer.publicPath) {
            publicPath = enforceLeadingSlash(context.app.devServer.publicPath);
            if (context.app.devServer.publicPathAbsolute) {
                context.webpackConfig.output.publicPath = `https://${host}:${port}` + publicPath;
            } else {
                context.webpackConfig.output.publicPath = publicPath;
            }
        }
        
        const args = await context.eventEmitter.emitHook(EventList.FILTER_WEBPACK_DEV_SERVER_CONFIG, {
            config: {
                ...((config as any).devServer ?? {}),
                noInfo: !context.parentContext.options.verbose,
                stats: !!context.parentContext.options.verbose,
                https: {
                    key: fs.readFileSync(
                        require.resolve('@labor-digital/ssl-certs/localmachine.space/localmachine.space.key')),
                    cert: fs.readFileSync(
                        require.resolve('@labor-digital/ssl-certs/localmachine.space/localmachine.space.crt')),
                    ca: fs.readFileSync(require.resolve('@labor-digital/ssl-certs/rootca/LaborRootCa.pem'))
                },
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
                },
                disableHostCheck: true,
                hot: true,
                ...(publicPath ? {publicPath} : {}),
                ...(context.app.devServer ? context.app.devServer.raw : {}),
                ...options?.devServer,
                host, port
            } as WebpackDevServer.Configuration,
            context
        });
        
        const devServerOptions: WebpackDevServer.Configuration = args.config;
        (config as any).devServer = devServerOptions;
        
        Dependencies.devServer.addDevServerEntrypoints(config as any, devServerOptions);
        
        const compiler = await context.do.makeCompiler({config});
        const server = new Dependencies.devServer(compiler as any, devServerOptions);
        
        let rendered = false;
        compiler.hooks.afterDone.tap('DevServerOutput', function () {
            if (rendered) {
                return;
            }
            rendered = true;
            
            setTimeout(() => {
                console.log(`[DEV SERVER]: ${Chalk.greenBright('started')}
Running on: https://${host}:${port}
Public path: https://${host}:${port}${publicPath ?? ''}
`);
            }, 1000);
        });
        
        // Destroy our temporary server
        if (tempServer) {
            await new Promise<void>(resolve => {
                tempServer.close(() => resolve());
            });
        }
        
        // Now, start the real server
        server.listen(port, host, function (err) {
            if (err) {
                throw new Error('Failed to start dev server, because: ' + err);
            }
        });
        
        return server;
    }
    
    /**
     * Resolving the port is a bit tricky, first we use the given option
     * Or we try to find a port using the port finder AND when doing so, we will
     * block the selected port, so no other process will steal it, right before our very eyes o.O
     * @param context
     * @protected
     */
    protected async resolvePort(context: WorkerContext): Promise<{ port: number, host: string, tempServer?: Server }>
    {
        const devServer = context.app.devServer!;
        if (!isPlainObject(devServer)) {
            throw new Error(
                'Can\'t start a dev server for app, because it was actively disabled using "devServer": false in the app configuration!');
        }
        
        const host = devServer.host ?? 'js.localmachine.space';
        let port = devServer.port;
        
        let tempServer: Server | undefined;
        if (!port) {
            
            tempServer = createServer(() => {});
            let error = false;
            tempServer.on('error', () => {error = true;});
            
            let hasPort = false;
            port = 8888;
            for (let i = 0; i < 10; i++) {
                error = false;
                port = await portfinder.getPortPromise({
                    port: port,
                    stopPort: 9000
                });
                context.logger.debug('Trying to bind to port: ' + port + ' (' + (i + 1) + '/10)');
                try {
                    tempServer.listen(port, host);
                    await new Promise<void>(resolve => {
                        setTimeout(() => resolve(), 500);
                        tempServer!.on('listening', () => {
                            resolve();
                        });
                    });
                    
                    if (error) {
                        continue;
                    }
                    
                    hasPort = true;
                    break;
                } catch (e) {
                    context.logger.debug('Failed to bind to port: ' + port + ', retry!');
                }
            }
            
            if (!hasPort) {
                throw new Error('Failed to find a port to run the dev-server on!');
            }
        }
        
        return {port, host, tempServer};
    }
}