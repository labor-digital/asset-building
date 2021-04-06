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
 * Last modified: 2021.04.01 at 13:39
 */

import {forEach, isArray, isPlainObject} from '@labor-digital/helferlein';
import Module from 'module';
import path from 'path';
import type {IBuilderOptions, IDependencyDefinition} from './types';

export class Dependencies
{
    protected static _resolved: Map<string, any> = new Map();
    protected static _definition: IDependencyDefinition = {
        webpack: 'webpack',
        tsCheckerPlugin: 'fork-ts-checker-webpack-plugin',
        sass: 'node-sass',
        terserPlugin: 'terser-webpack-plugin',
        cssMinimizerPlugin: 'css-minimizer-webpack-plugin',
        htmlPlugin: 'html-webpack-plugin',
        filterWarningsPlugin: 'webpack-filter-warnings-plugin',
        cssExtractPlugin: 'mini-css-extract-plugin',
        copyPlugin: 'copy-webpack-plugin',
        cleanOutputPlugin: 'clean-webpack-plugin',
        analyzerPlugin: 'webpack-bundle-analyzer',
        devServer: 'webpack-dev-server'
    };
    
    /**
     * Allows you to override a dependency definition with another one. This allows us to use
     * an external webpack instead of the bundled one
     * @param key
     * @param dependency
     */
    public static setDefinition(key: keyof IDependencyDefinition | string, dependency: string): void
    {
        Dependencies._definition[key] = dependency;
    }
    
    /**
     * Similar to setDefinition() but will resolve a dependency as a foreign module
     * @param key
     * @param pathName
     * @param dependency
     */
    public static setDefinitionFromPath(
        key: keyof IDependencyDefinition | string,
        pathName: string | Array<string>,
        dependency: string
    )
    {
        if (isArray(pathName)) {
            pathName = path.join(pathName as any);
        }
        
        if (!path.isAbsolute(pathName)) {
            pathName = path.join(process.cwd(), pathName);
        }
        
        const fromFile = path.join(pathName, 'noop.js');
        const resolvedDependency = (Module as any)._resolveFilename(dependency, {
            id: fromFile,
            filename: fromFile,
            paths: [
                pathName,
                ...(Module as any)._nodeModulePaths(pathName)
            ]
        });
        
        Dependencies.setDefinition(key, resolvedDependency);
    }
    
    public static get webpack(): typeof import('webpack')
    {
        return Dependencies.resolveDependency('webpack');
    }
    
    public static get sass(): typeof import('node-sass')
    {
        return Dependencies.resolveDependency('sass');
    }
    
    public static get tsCheckerPlugin(): typeof import('fork-ts-checker-webpack-plugin')
    {
        return Dependencies.resolveDependency('tsCheckerPlugin');
    }
    
    // @ts-ignore
    public static get terserPlugin(): typeof import('terser-webpack-plugin')
    {
        return Dependencies.resolveDependency('terserPlugin');
    }
    
    // @ts-ignore
    public static get cssMinimizerPlugin(): typeof import('css-minimizer-webpack-plugin')
    {
        return Dependencies.resolveDependency('cssMinimizerPlugin');
    }
    
    public static get htmlPlugin(): typeof import('html-webpack-plugin')
    {
        return Dependencies.resolveDependency('htmlPlugin');
    }
    
    // @ts-ignore
    public static get filterWarningsPlugin(): typeof import('webpack-filter-warnings-plugin')
    {
        return Dependencies.resolveDependency('filterWarningsPlugin');
    }
    
    // @ts-ignore
    public static get cssExtractPlugin(): typeof import('mini-css-extract-plugin')
    {
        return Dependencies.resolveDependency('cssExtractPlugin');
    }
    
    // @ts-ignore
    public static get copyPlugin(): typeof import('copy-webpack-plugin')
    {
        return Dependencies.resolveDependency('copyPlugin');
    }
    
    public static get cleanOutputPlugin(): typeof import('clean-webpack-plugin')
    {
        return Dependencies.resolveDependency('cleanOutputPlugin');
    }
    
    // @ts-ignore
    public static get analyzerPlugin(): typeof import('webpack-bundle-analyzer')
    {
        return Dependencies.resolveDependency('analyzerPlugin');
    }
    
    public static get devServer(): typeof import('webpack-dev-server')
    {
        return Dependencies.resolveDependency('devServer');
    }
    
    /**
     * Allows you to retrieve a dependency by key, which is helpful if you write your own extension.
     * @param key
     */
    public static get(key: string): any
    {
        if (!Dependencies._definition[key]) {
            throw new Error('There is no registered dependency with key: "' + key + '"!');
        }
        
        return Dependencies.resolveDependency(key);
    }
    
    /**
     * Export the registered dependencies for cross-process messaging
     */
    public static export(): IDependencyDefinition
    {
        return {...Dependencies._definition};
    }
    
    /**
     * Import the given definitions that were transferred to the worker process
     * @param definition
     */
    public static import(definition: IDependencyDefinition)
    {
        forEach(definition, (v, dep) => Dependencies._definition[dep] = v);
    }
    
    /**
     * Helper to inherit possible dependencies from the builder options
     * @param options
     */
    public static inheritFromOptions(options?: IBuilderOptions): void
    {
        if (!options || !isPlainObject(options.dependencies)) {
            return;
        }
        
        Dependencies.import(options.dependencies);
    }
    
    /**
     * Internal resolver/caching to resolve the actual dependencies
     * @param key
     * @protected
     */
    protected static resolveDependency(key: keyof IDependencyDefinition | string): any
    {
        if (Dependencies._resolved.has(key)) {
            return Dependencies._resolved.get(key)!;
        }
        
        if (!Dependencies._definition[key]) {
            throw new Error('Required a dependency "' + key + '" that does not have a definition!');
        }
        
        const i = require(Dependencies._definition[key]!);
        Dependencies._resolved.set(key, i);
        return i;
    }
}