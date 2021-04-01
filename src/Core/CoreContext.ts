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

import {asArray, EventBus, EventEmitter, forEach, isString, PlainObject} from '@labor-digital/helferlein';
import * as path from 'path';
import {ExtensionLoader} from '../Extension/ExtensionLoader';
import {IO} from './IO';
import {Logger} from './Logger';
import {ProcessManager} from './ProcessManager';
import {ProgressManager} from './Progress/ProgressManager';
import type {IBuilderOptions, IPathList, TBuilderEnvironment, TBuilderMode} from './types';

export class CoreContext
{
    /**
     * Contains the version number of the asset builder package
     */
    public version!: string;
    
    /**
     * Defines if the current process is the main process or a worker
     */
    public process!: 'main' | 'worker';
    
    /**
     * The list of options that have been given when the builder was created
     */
    public options!: IBuilderOptions;
    
    /**
     * Defines the inter-op environment the asset builder runs in
     */
    public environment!: TBuilderEnvironment;
    
    /**
     * Defines the type of this context
     */
    public type: 'core' = 'core';
    
    /**
     * The mode key which was given as cli parameter
     */
    public mode!: TBuilderMode;
    
    /**
     * True if this app should be executed as webpack' "production" mode
     * By default this is set to true if "mode" is "production"
     */
    public isProd: boolean = false;
    
    /**
     * The list of relevant paths for this context
     */
    public paths!: IPathList;
    
    /**
     * The event bus instance we use in this context
     */
    public eventEmitter!: EventEmitter;
    
    /**
     * The extension loader instance
     */
    public extensionLoader!: ExtensionLoader;
    
    /**
     * The process manager to create child processes with
     */
    public processManager!: ProcessManager;
    
    /**
     * A simple logger to dump verbose output;
     */
    public logger!: Logger;
    
    /**
     * IO manager to orchestrate the output of the different processes in a unified matter
     */
    public io!: IO;
    
    /**
     * Manager to handle the rendering of progress bars for the different processes
     */
    public progressManager!: ProgressManager;
    
    protected constructor() {}
    
    /**
     * Create a clone of the current context object
     */
    public makeClone(): CoreContext
    {
        const i = new CoreContext();
        i.hydrateFromJson(JSON.parse(this.toJson()));
        i.instantiateChildren(this);
        return i;
    }
    
    protected hydrateFromJson(jsonData?: PlainObject): void
    {
        forEach(jsonData as PlainObject, (v, k) => {
            if (k === 'paths') {
                const paths: IPathList = v;
                paths.additionalResolverPaths = new Set(paths.additionalResolverPaths);
            }
            
            this[k] = v;
        });
    }
    
    protected hydrateFromOptions(options: IBuilderOptions): void
    {
        const sourcePath = path.normalize(options.cwd ?? process.cwd());
        const assetBuilderPath = path.dirname(__dirname);
        const additionalResolverPaths = new Set<string>();
        
        this.paths = {
            source: sourcePath,
            assetBuilder: assetBuilderPath,
            nodeModules: path.resolve(sourcePath, 'node_modules'),
            buildingNodeModules: path.resolve(assetBuilderPath, '..', 'node_modules'),
            additionalResolverPaths
        };
        
        additionalResolverPaths.add(this.paths.nodeModules);
        additionalResolverPaths.add(this.paths.buildingNodeModules);
        additionalResolverPaths.add('node_modules' + path.sep);
        additionalResolverPaths.add(path.sep);
        additionalResolverPaths.add('.' + path.sep);
        
        this.options = options;
        this.process = 'main';
        this.mode = options.mode ?? 'production';
        this.environment = options.environment ?? 'standalone';
        this.version = require(path.resolve(this.paths.assetBuilder, '..', 'package.json')).version;
    }
    
    protected instantiateChildren(cloneBase?: CoreContext): void
    {
        if (cloneBase) {
            // Just inherit the services from the original core context, instead of creating new instances
            forEach(['logger', 'eventEmitter', 'extensionLoader', 'io', 'progressManager'], el => {
                this[el] = cloneBase[el];
            });
        } else {
            this.eventEmitter = EventBus.getEmitter();
            this.extensionLoader = new ExtensionLoader();
            this.processManager = new ProcessManager(this);
            this.io = new IO(this);
            this.logger = new Logger(this.io, this.options?.verbose ?? false);
            this.progressManager = new ProgressManager(this);
        }
    }
    
    /**
     * Dumps the current context object as a json string
     */
    public toJson(): string
    {
        const paths = {...this.paths, additionalResolverPaths: asArray(this.paths.additionalResolverPaths)};
        
        return JSON.stringify({
            options: this.options,
            type: this.type,
            process: this.process,
            version: this.version,
            isProd: this.isProd,
            environment: this.environment,
            mode: this.mode,
            paths: paths
        });
    }
    
    /**
     * Creates a new instance of the context object
     * @param options
     */
    public static new(options: IBuilderOptions): CoreContext
    {
        const i = new CoreContext();
        i.hydrateFromOptions(options);
        i.instantiateChildren();
        return i;
    }
    
    /**
     * Factory method to create a new instance of this class based on a given json representation of itself.
     * @param json
     * @param process
     */
    public static fromJson(json: string, process?: 'main' | 'worker'): CoreContext
    {
        const i = new CoreContext();
        i.hydrateFromJson(JSON.parse(json));
        if (isString(process)) {
            i.process = process;
        }
        i.instantiateChildren();
        return i;
    }
}