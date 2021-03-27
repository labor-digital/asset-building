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

import {isArray} from '@labor-digital/helferlein';
import Chalk from 'chalk';
import portfinder from 'portfinder';
import WebpackDevServer from 'webpack-dev-server';
import type {WorkerContext} from '../../Core/WorkerContext';
import {PluginIdentifier} from '../../Identifier';
import type {IRunDevServerOptions} from './types';
import type {WorkerActionInterface} from './WorkerActionInterface';

export class RunDevServerAction implements WorkerActionInterface
{
    public async do(context: WorkerContext, options?: IRunDevServerOptions): Promise<WebpackDevServer>
    {
        const config = await context.do.makeConfig({
            disable: [
                PluginIdentifier.GIT_ADD,
                ...options?.compiler?.makeConfigOptions?.disable ?? []
            ]
        });
        
        const port = context.app.devServer?.port ?? await portfinder.getPortPromise({
            port: 8888,
            stopPort: 9000
        });
        const host = context.app.devServer?.host ?? 'localhost';
        
        if (!isArray(config.entry)) {
            config.entry = [config.entry as any];
        }
        
        config.entry.unshift('webpack-dev-server/client?http://' + host + ':' + port);
        
        const devServerOptions: WebpackDevServer.Configuration = {
            noInfo: true,
            hot: true,
            ...options?.devServer
        };
        
        WebpackDevServer.addDevServerEntrypoints(config, devServerOptions);
        
        const compiler = await context.do.makeCompiler({config});
        const server = new WebpackDevServer(compiler, devServerOptions);
        
        let rendered = false;
        compiler.hooks.afterDone.tap('DevServerOutput', function () {
            if (rendered) {
                return;
            }
            rendered = true;
            
            console.log(`
[DEV SERVER]: ${Chalk.greenBright('started')}
Running on: http://${host}:${port}
`);
        });
        
        server.listen(port, host, function (err) {
            if (err) {
                throw new Error('Failed to start dev server, because: ' + err);
            }
            
            
        });
        
        return server;
    }
}