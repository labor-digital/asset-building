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
 * Last modified: 2021.04.06 at 08:32
 */

import {asArray, forEach} from '@labor-digital/helferlein';
import Module from 'module';
import path from 'path';

export class IncludePathRegistry
{
    protected static _fallbackPaths: Array<string> = [];
    
    protected static _isRegistered: boolean = false;
    
    /**
     * Adds a new fallback path to the end of of the fallback path list -> meaning the path is loaded less likely
     * @param pathName
     */
    public static appendFallbackPath(pathName: string): void
    {
        IncludePathRegistry.addPath(IncludePathRegistry._fallbackPaths, pathName, 'push');
    }
    
    /**
     * Adds a new fallback path to the start of of the fallback path list -> meaning the path is loaded more likely
     * @param pathName
     */
    public static prependFallbackPath(pathName: string): void
    {
        IncludePathRegistry.addPath(IncludePathRegistry._fallbackPaths, pathName, 'unshift');
    }
    
    /**
     * Exports all registered paths as array
     */
    public static export(): Array<string>
    {
        return [...IncludePathRegistry._fallbackPaths];
    }
    
    /**
     * Imports the given list of paths and replaces all existing paths
     * @param paths
     */
    public static import(paths: Array<string>): void
    {
        this._fallbackPaths = asArray(new Set(paths));
    }
    
    /**
     * Registers ourself as global fallback handler when a module could not be resolved
     */
    public static register(): void
    {
        if (IncludePathRegistry._isRegistered) {
            return;
        }
        IncludePathRegistry._isRegistered = true;
        
        const resolver = (Module as any)._resolveFilename;
        (Module as any)._resolveFilename = function resolveFilenameOverride(
            request: string,
            parent: Module,
            isMain: boolean,
            options?: any
        ) {
            const pathsBackup = parent.paths;
            parent.paths = asArray(new Set(
                [...parent.paths, ...IncludePathRegistry._fallbackPaths]
            ));
            const result = resolver(request, parent, isMain, options);
            parent.paths = pathsBackup;
            return result;
        };
    }
    
    /**
     * Returns the list of "resolve" paths that are supplied to webpack
     */
    public static getResolvePaths(): Array<string>
    {
        return [
            'node_modules' + path.sep,
            process.cwd() + path.sep,
            // path.sep,
            '.' + path.sep,
            ...IncludePathRegistry._fallbackPaths
        ];
    }
    
    /**
     * Internal helper to add a new path and all its possible permutations to the list of fallback paths
     * @param list
     * @param pathName
     * @param method
     * @protected
     */
    protected static addPath(list: Array<string>, pathName: string, method: 'push' | 'unshift'): void
    {
        
        if (!path.isAbsolute(pathName)) {
            pathName = path.join(process.cwd(), pathName);
        }
        
        const paths = (Module as any)._nodeModulePaths(pathName);
        
        if (method === 'unshift') {
            paths.reverse();
        }
        
        paths.unshift(pathName);
        
        forEach(paths, ns => {
            if (list.indexOf(ns) !== -1) {
                return;
            }
            list[method](ns);
        });
        
        list = asArray(new Set(paths));
    }
}