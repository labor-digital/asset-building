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
 * Last modified: 2020.10.21 at 17:40
 */

import type {AppDefinitionInterface} from '../Interfaces/AppDefinitionInterface';
import type {LaborConfigInterface} from '../Interfaces/LaborConfigInterface';

export type TBuilderMode = 'production' | 'dev' | 'analyze' | string;
export type TBuilderEnvironment = 'standalone' | 'nuxt' | 'express' | 'storybook' | string;

export interface FactoryCoreContextOptions
{
    /**
     * The absolute path to the working directory.
     * If omitted process.cwd() is used
     */
    cwd?: string;
    
    /**
     * A valid mode to boot the asset builder with
     * "production" to build the script as a production ready bundle
     * "dev" to build the bundle with a (much faster) development mode
     * "analyze" to run the webpack bundle analyzer
     * @see https://asset-building.labor.tools/guide/CoreFeatures.html#commands-modes
     */
    mode?: TBuilderMode;
    
    /**
     * If set to true, webpack will run in watch mode
     */
    watch?: boolean;
    
    /**
     * A speaking identifier to allow the configurator to see from which context it was instantiated.
     * This can be something like "storybook", "nuxt", "express", a custom string or "standalone" if omitted
     */
    environment?: TBuilderEnvironment;
    
    /**
     * The path to the asset builder's package.json file.
     * Either as path relative to the factory file, or absolute path
     */
    packageJsonPath?: string
    
    /**
     * If this is provided the factory will not try to load the configuration from the package.json
     * file in the current project directory. It will instead use this definition as config base
     */
    laborConfig?: LaborConfigInterface;
    
    /**
     * Internal helper to supply a app definition from which the additional
     * resolver paths should be provided when the core context is created.
     * This is a hacky solution to allow node to resolve our dependencies without issues
     */
    additionalResolversForApp?: AppDefinitionInterface
}

export interface FactoryWorkerContextOptions
{
    
    /**
     * Can contain the numeric id of an app (resolved inside laborConfig), or a full blown app configuration
     * object that will be used in the config builder
     */
    app?: number | AppDefinitionInterface;
    
    /**
     * By default the core context will be cloned to prevent pollution if you work with custom instances.
     * This, however means it will no longer be avaialbe on your given references. If you set this to FALSE
     * the original context will be kept and not cloned, modifying the given instance. I can see some edge cases
     * where this will come in handy...
     */
    cloneCoreContext?: boolean;
    
    /**
     * If set to true, the app definition will not validate the entry or output configuration.
     * This can be useful if you create the builder for services that already create their own entry point
     */
    noEntryOutputValidation?: boolean;
    
}