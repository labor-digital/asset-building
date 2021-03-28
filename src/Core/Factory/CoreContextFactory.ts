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

import {
    filter,
    forEach,
    isArray,
    isEmpty,
    isNull,
    isNumeric,
    isPlainObject,
    makeOptions,
    PlainObject
} from '@labor-digital/helferlein';
import Chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {EventList} from '../../EventList';
import {CoreContext} from '../CoreContext';
import {CoreFixes} from '../CoreFixes';
import BuilderOptionSchema from '../Schema/BuilderOptionSchema';
import type {IBuilderOptions, TBuilderMode} from '../types';

export class CoreContextFactory
{
    /**
     * Creates a new instance of the core context object based on the given options
     * @param options
     */
    public async make(options?: IBuilderOptions): Promise<CoreContext>
    {
        options = this.enhanceOptionsFromPackageJson(options);
        options = this.prepareOptions(options);
        
        const context = new CoreContext(options);
        CoreFixes.resolveFilenameFix(context);
        await this.loadExtensions(context);
        await this.findMode(context);
        await context.eventEmitter.emitHook(EventList.AFTER_MAIN_INIT_DONE, {context});
        
        return context;
    }
    
    /**
     * Tries to enhance the options by finding a package json and extracting the "labor" node from it.
     * @param options
     * @protected
     */
    protected enhanceOptionsFromPackageJson(options?: IBuilderOptions): IBuilderOptions
    {
        options = options ?? {};
        
        options.cwd = options.cwd ?? process.cwd();
        
        // Ignore this if the option was set to false
        if (options.packageJsonPath === false) {
            delete options.packageJsonPath;
            return options;
        }
        
        let packageJson: null | string = null;
        if (options.packageJsonPath) {
            if (fs.existsSync(options.packageJsonPath)) {
                packageJson = options.packageJsonPath;
            } else {
                const tmpPath = path.resolve(options.cwd, options.packageJsonPath);
                if (!fs.existsSync(tmpPath)) {
                    throw new Error('Invalid "packageJsonPath" option given! The file was not found at: ' + tmpPath);
                }
                packageJson = tmpPath;
            }
        }
        
        if (isNull(packageJson)) {
            packageJson = path.resolve(options.cwd, 'package.json');
            if (!fs.existsSync(packageJson)) {
                packageJson = null;
            }
        }
        
        if (isNull(packageJson)) {
            return options;
        }
        
        options.packageJsonPath = packageJson;
        
        const pJson = require(packageJson);
        if (!isPlainObject(pJson.labor)) {
            return options;
        }
        
        const lab: PlainObject = pJson.labor;
        
        forEach(['extensions', 'apps', 'additionalResolverPaths'], field => {
            if (isArray(lab[field])) {
                options![field] = [
                    ...(options![field] ?? []),
                    ...lab[field]
                ];
            }
        });
        
        return options;
    }
    
    /**
     * Prepares the options by applying the schema and defining the app list to load
     * @param options
     * @protected
     */
    protected prepareOptions(options: IBuilderOptions): IBuilderOptions
    {
        options = makeOptions(options, BuilderOptionSchema);
        
        // Validates the options schema and checks if some app definitions are present
        if (!isPlainObject(options.app) && isEmpty(options.apps)) {
            throw new Error('You need to define either an array of "apps" or a single "app" option!');
        }
        
        // Make sure every ap has a unique id
        if (isArray(options.apps)) {
            forEach(options.apps, (app, k) => {
                app.id = app.id ?? k;
            });
        }
        
        // Make sure only the selected app has priority
        if (isNumeric(options.app)) {
            if (!options.apps || !options.apps[options.app]) {
                throw new Error('Invalid option "app" (' + options.app + '), there is no app with this index!');
            }
            options.apps = [options.apps[options.app]];
        } else if (isPlainObject(options.app)) {
            options.apps = [options.app];
        }
        
        // Filter out disabled apps
        options.apps = filter(options.apps as any, v => v.disabled);
        if (options.apps.length === 0) {
            throw new Error('All apps have been disabled! So there is nothing left to do!');
        }
        
        return options;
    }
    
    /**
     * Loads the global extensions from the given labor configuration
     * @param context
     * @protected
     */
    protected async loadExtensions(context: CoreContext): Promise<void>
    {
        await context.extensionLoader
                     .loadExtensionsFromDefinition('global', context, context.options);
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
        let mode: TBuilderMode = context.options.mode ?? context.mode;
        
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
        
        if (mode === 'analyze') {
            console.log(
                Chalk.yellowBright('Please note: "analyze" mode started, this forces webpack to "watch" for changed!'));
            context.options.watch = true;
        }
        
        args = await context.eventEmitter.emitHook(EventList.IS_PROD, {
            isProd: mode === 'production' || mode === 'analyze',
            mode,
            modes,
            coreContext: context
        });
        
        context.isProd = args.isProd;
    }
}