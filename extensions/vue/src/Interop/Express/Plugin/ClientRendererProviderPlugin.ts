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
import type MemoryFileSystem from 'memory-fs';
import path from 'path';
import type {Compiler} from 'webpack';

export const ClientRendererProviderPlugin: IAssetBuilderPluginStatic = class implements IAssetBuilderPlugin
{
    public apply(compiler: Compiler): any
    {
        compiler.hooks.done.tap('ClientRendererProviderPlugin', () => {
            const mfs: MemoryFileSystem = compiler.outputFileSystem as any;
            
            // Update the client manifest
            const clientManifestPath = path.join(compiler.options!.output!.path!, 'vue-ssr-client-manifest.json');
            if (mfs.existsSync(clientManifestPath)) {
                global.EXPRESS_VUE_SSR_UPDATE_RENDERER('clientManifest',
                    mfs.readFileSync(clientManifestPath).toString('utf-8'));
            }
            
            // Update the template
            const indexFilePath = path.join(compiler.options!.output!.path!, 'index.html');
            if (mfs.existsSync(indexFilePath)) {
                global.EXPRESS_VUE_SSR_UPDATE_RENDERER('template', mfs.readFileSync(indexFilePath).toString('utf-8'));
            }
        });
    }
    
    public setContext(_: WorkerContext): void {}
};