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
 * Last modified: 2020.10.21 at 19:12
 */

import {isArray, isBool, isUndefined} from '@labor-digital/helferlein';
import fs from 'fs';
import path from 'path';
import {isPlainObject} from 'webpack-merge/dist/utils';
import {EventList} from '../../EventList';
import {FileHelpers} from '../../Helpers/FileHelpers';
import {CoreContext} from '../CoreContext';
import {CoreFixes} from '../CoreFixes';
import type {FactoryCoreContextOptions, TBuilderMode} from '../Factory.interfaces';

export class CoreContextFactory
{
    
    /**
     * The options used to create the context with
     * @protected
     */
    protected _options: FactoryCoreContextOptions = {};
    
    /**
     * Creates a new instance of the core context object based on the given options
     * @param options
     */
    public async make(options?: FactoryCoreContextOptions): Promise<CoreContext>
    {
        this._options = options ?? {};
        
        const context = this.makeNewContextInstance();
        this.loadConfig(context);
        this.applyModuleResolverFix(context);
        await this.loadExtensions(context);
        await this.filterLaborConfig(context);
        this.applyLaborConfig(context);
        await this.findMode(context);
        this.ensureWorkDirectory(context);
        this.applyDummyAppIfRequired(context);
        await this.emitInitDone(context);
        
        return context;
    }
    
    /**
     * Creates a new, empty context instance with only the most basic settings applied
     *
     * IMPORTANT: Note to self -> This has to be synchronous so storybook does not break!
     * @protected
     */
    protected makeNewContextInstance(): CoreContext
    {
        return new CoreContext(
            this._options.cwd ?? process.cwd(),
            path.dirname(path.dirname(__dirname)),
            this._options.environment ?? 'standalone',
            require('../../../package.json').version,
            this._options.watch ?? false
        );
    }
    
    /**
     * Either loads the asset builder configuration from the source package.json or
     * uses the given configuration from the options
     * @param context
     * @protected
     */
    protected loadConfig(context: CoreContext): void
    {
        if (isUndefined(this._options.laborConfig)) {
            // Check if we are in the correct directory
            if (!fs.existsSync(context.packageJsonPath)) {
                throw new Error('Could not find package.json at: "' + context.packageJsonPath + '"');
            }
            
            // Load the config using the package json
            const packageJson = JSON.parse(fs.readFileSync(context.packageJsonPath).toString('utf-8'));
            if (typeof packageJson.labor === 'undefined') {
                throw new Error('There is no "labor" node inside your current package json!');
            }
            context.laborConfig = packageJson.labor;
            return;
        }
        
        context.laborConfig = this._options.laborConfig ?? {};
    }
    
    /**
     * Applys the module resolver fix so that node_modules of the asset builder as well as all registerd
     * apps can be found by all node modules
     * @param context
     * @protected
     */
    protected applyModuleResolverFix(context: CoreContext): void
    {
        context.extensionLoader.resolveAdditionalResolverPaths(context,
            this._options.laborConfig?.additionalResolverPaths ?? {});
        
        context.extensionLoader.resolveAdditionalResolverPaths(context,
            isPlainObject(this._options.additionalResolversForApp)
                ? this._options.additionalResolversForApp! : {});
        
        CoreFixes.resolveFilenameFix(context);
    }
    
    /**
     * Loads the global extensions from the given labor configuration
     * @param context
     * @protected
     */
    protected async loadExtensions(context: CoreContext): Promise<void>
    {
        await context.extensionLoader
                     .loadExtensionsFromDefinition('global', context, context.laborConfig);
    }
    
    /**
     * Emits the FILTER_LABOR_CONFIG hook to allow extensions to filter the labor config
     * @param context
     * @protected
     */
    protected async filterLaborConfig(context: CoreContext): Promise<void>
    {
        const args = await context.eventEmitter.emitHook(EventList.FILTER_LABOR_CONFIG, {
            laborConfig: context.laborConfig,
            context: context
        });
        
        context.laborConfig = args.laborConfig;
    }
    
    /**
     * Applys the global labor configuration to the new context instance
     * @param context
     * @protected
     */
    protected applyLaborConfig(context: CoreContext): void
    {
        // Check if we are running in sequential mode
        context.runWorkersSequential = isBool(context.laborConfig.runWorkersSequential) ?
            context.laborConfig.runWorkersSequential : false;
    }
    
    /**
     * Finds and validates the given mode we should build the config for
     * @param context
     */
    protected async findMode(context: CoreContext): Promise<void>
    {
        let args = await context.eventEmitter.emitHook(EventList.GET_MODES, {
            modes: ['dev', 'production', 'analyze']
        });
        
        const modes: Array<TBuilderMode> = args.modes;
        let mode: TBuilderMode = this._options.mode ?? context.mode;
        
        args = await context.eventEmitter.emitHook(EventList.GET_MODE, {
            mode, context: context, modes
        });
        mode = args.mode;
        
        // Validate mode
        if (mode === '') {
            throw new Error('You did not transfer a mode parameter (e.g. dev, production) to the call!');
        }
        if (modes.indexOf(mode) === -1) {
            throw new Error('Invalid mode given: "' + mode + '", valid modes are: "' + modes.join(', ') + '"!');
        }
        
        context.mode = mode;
        
        args = await context.eventEmitter.emitHook(EventList.IS_PROD, {
            isProd: mode === 'production' || mode === 'analyze',
            mode,
            modes,
            coreContext: context
        });
        
        context.isProd = args.isProd;
    }
    
    /**
     * There might be cases where there is actually no webpack config involved, but we are
     * running other tasks, like copying files e.g. in that case we create a dummy application
     * @param context
     */
    protected applyDummyAppIfRequired(context: CoreContext): void
    {
        if (isArray(context.laborConfig.apps) && context.laborConfig.apps.length > 0) {
            return;
        }
        
        FileHelpers.touch(context.workDirectoryPath + 'dummy.js');
        context.laborConfig.apps = [
            {
                appName: 'Dummy App',
                entry: path.relative(context.sourcePath, context.workDirectoryPath + 'dummy.js'),
                output: path.relative(context.sourcePath, context.workDirectoryPath + 'dist' + path.sep + 'dummy.js')
            }
        ];
        
    };
    
    /**
     * Makes sure the work directory exists and is keept nice and clean
     * @param context
     * @protected
     */
    protected ensureWorkDirectory(context: CoreContext): void
    {
        FileHelpers.mkdir(context.workDirectoryPath);
        FileHelpers.flushDirectory(context.workDirectoryPath);
    };
    
    /**
     * Emits the late hook to filter the context after it was completely instantiated
     * @param context
     * @protected
     */
    protected emitInitDone(context: CoreContext): Promise<any>
    {
        return context.eventEmitter
                      .emitHook(EventList.AFTER_MAIN_INIT_DONE, {context});
    }
}