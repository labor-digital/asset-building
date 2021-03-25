/*
 * Copyright 2019 LABOR.digital
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
 * Last modified: 2019.10.05 at 17:26
 */

import {asArray, EventBus, EventEmitter, forEach} from '@labor-digital/helferlein';
import * as path from 'path';
import {ExtensionLoader} from '../Extension/ExtensionLoader';
import type {LaborConfigInterface} from '../Interfaces/LaborConfigInterface';
import type {TBuilderMode} from './Factory.interfaces';

export class CoreContext
{
    
    /**
     * Contains the version number of the asset builder package
     */
    public version: string = '1.0.0';
    
    /**
     * Defines if the current process is the main process or a worker
     */
    public process: 'main' | 'worker' = 'main';
    
    /**
     * Defines the inter-op environment the asset builder runs in
     */
    public environment: TBuilderMode = 'standalone';
    
    /**
     * Defines the type of this context
     */
    public type: 'core' = 'core';
    
    /**
     * If this is true the workers will be spawn in sequential order instead of being called as parallel processes
     */
    public runWorkersSequential: boolean = false;
    
    /**
     * The mode key which was given as cli parameter
     */
    public mode: TBuilderMode = 'production';
    
    /**
     * True if this app should be executed as webpack's "production" mode
     * By default this is set to true if "mode" is "production"
     */
    public isProd: boolean = true;
    
    /**
     * If set to true, webpack will run in watch mode
     */
    public watch: boolean = false;
    
    /**
     * The path to the source directory
     */
    public sourcePath: string = '';
    
    /**
     * The directory of the asset builder
     */
    public assetBuilderPath: string = '';
    
    /**
     * The absolute path to the node modules inside the working directory path
     */
    public nodeModulesPath: string = '';
    
    /**
     * The absolute path to the asset-building's node modules
     */
    public buildingNodeModulesPath: string = '';
    
    /**
     * The absolute path to the base package's package.json
     */
    public packageJsonPath: string = '';
    
    /**
     * Is used to store additional paths that should be used for node and webpack file resolution
     * in addition to the default node_modules directory
     */
    public additionalResolverPaths: Set<string> = new Set();
    
    /**
     * The directory where we will put dynamically generated files
     */
    public workDirectoryPath: string = '';
    
    /**
     * The file which is used to ship this context from one process to another
     */
    public coreContextFilePath: string = '';
    
    /**
     * The event bus instance we use in this context
     */
    public eventEmitter: EventEmitter = EventBus.getEmitter();
    
    /**
     * The extension loader instance
     */
    public extensionLoader: ExtensionLoader = new ExtensionLoader();
    
    /**
     * The raw labor configuration object
     */
    public laborConfig: LaborConfigInterface = {};
    
    constructor(cwd: string, assetBuilderPath: string, environment: string, version: string, watch: boolean)
    {
        if (cwd === '' && assetBuilderPath === '' && environment === '') {
            return;
        }
        
        this.version = version;
        this.type = 'core';
        this.process = 'main';
        this.watch = watch;
        this.environment = environment;
        this.runWorkersSequential = false;
        this.sourcePath = cwd.replace(/\\\/$/g, '') + path.sep;
        this.assetBuilderPath = assetBuilderPath.replace(/\\\/$/g, '') + path.sep;
        this.nodeModulesPath = this.sourcePath + 'node_modules' + path.sep;
        this.buildingNodeModulesPath = path.resolve(this.assetBuilderPath, '../node_modules/') + path.sep;
        this.packageJsonPath = this.sourcePath + 'package.json';
        this.workDirectoryPath = this.nodeModulesPath + '.cache' + path.sep + 'labor-asset-builder-tmp' + path.sep;
        this.coreContextFilePath = this.workDirectoryPath + 'coreContext.json';
        
        // Build additional paths
        this.additionalResolverPaths = new Set();
        this.additionalResolverPaths.add(this.nodeModulesPath);
        this.additionalResolverPaths.add(this.buildingNodeModulesPath);
        this.additionalResolverPaths.add('node_modules' + path.sep);
        this.additionalResolverPaths.add(path.sep);
        this.additionalResolverPaths.add('.' + path.sep);
    }
    
    /**
     * Dumps the current context object as a json string
     */
    public toJson(): string
    {
        return JSON.stringify({
            type: this.type,
            process: this.process,
            version: this.version,
            isProd: this.isProd,
            environment: this.environment,
            mode: this.mode,
            watch: this.watch,
            sourcePath: this.sourcePath,
            assetBuilderPath: this.assetBuilderPath,
            nodeModulesPath: this.nodeModulesPath,
            buildingNodeModulesPath: this.buildingNodeModulesPath,
            packageJsonPath: this.packageJsonPath,
            workDirectoryPath: this.workDirectoryPath,
            coreContextFilePath: this.coreContextFilePath,
            additionalResolverPaths: asArray(this.additionalResolverPaths),
            laborConfig: this.laborConfig,
            runWorkersSequential: this.runWorkersSequential
        });
    }
    
    /**
     * Factory method to create a new instance of this class based on a given json representation of itself.
     * @param json
     */
    public static fromJson(json: string): CoreContext
    {
        const self = new CoreContext('', '', '', '', false);
        const data = JSON.parse(json);
        forEach(data, (v, k) => {
            if (k === 'additionalResolverPaths') {
                v = new Set(v);
            }
            self[k] = v;
        });
        return self;
    }
}