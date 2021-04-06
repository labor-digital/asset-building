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
 * Last modified: 2021.03.30 at 21:00
 */

import type {IAssetBuilderPlugin, IAssetBuilderPluginStatic, WorkerContext} from '@labor-digital/asset-building';
import path from 'path';
import type {Compiler} from 'webpack';

export const ServerRendererProviderPlugin: IAssetBuilderPluginStatic = class implements IAssetBuilderPlugin
{
    public apply(compiler: Compiler): any
    {
        // Set the compiler to the memory fs
        const MFS = require('memory-fs');
        const mfs = new MFS();
        compiler.outputFileSystem = mfs;
        
        compiler.hooks.done.tap('ServerRendererProviderPlugin', () => {
            const bundlePath = path.join(compiler.options!.output!.path!, 'vue-ssr-server-bundle.json');
            process.send!({
                VUE_SSR_BUNDLE: mfs.existsSync(bundlePath) ?
                    JSON.parse(mfs.readFileSync(bundlePath, 'utf-8')) : null
            });
        });
    }
    
    public setContext(_: WorkerContext): void {}
};