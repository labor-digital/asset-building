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
 * Last modified: 2020.10.21 at 20:19
 */

import {cloneList, forEach, isArray, makeOptions} from '@labor-digital/helferlein';
import {EventList} from '../../EventList';
import {CoreContext} from '../CoreContext';
import {Logger} from '../Logger';
import AppDefinitionSchema from '../Schema/AppDefinitionSchema';
import type {IAppDefinition} from '../types';
import {WorkerContext} from '../WorkerContext';

export class WorkerContextFactory
{
    /**
     * Creates a new worker context instance based on the core context and given options
     * @param coreContext
     * @param app
     */
    public async make(coreContext: CoreContext, app: IAppDefinition): Promise<WorkerContext>
    {
        const localCoreContext = this.cloneCoreContextIfRequired(coreContext);
        localCoreContext.logger.setName(app.appName!);
        const context = new WorkerContext(localCoreContext, app);
        
        await this.loadExtensions(context);
        await this.applyAppSchema(context);
        this.applyAppConfig(context);
        await context.eventEmitter.emitHook(EventList.AFTER_WORKER_INIT_DONE, {context});
        
        return context;
    }
    
    /**
     * Creates a deep clone of the core context to avoid pollution while setting up the worker context
     * @param coreContext
     * @protected
     */
    protected cloneCoreContextIfRequired(coreContext: CoreContext): CoreContext
    {
        if (!coreContext.options.cloneCoreContext) {
            return coreContext;
        }
        
        const clone = CoreContext.fromJson(coreContext.toJson());
        clone.eventEmitter = coreContext.eventEmitter;
        clone.extensionLoader = coreContext.extensionLoader;
        clone.logger = new Logger(coreContext.options.verbose ?? false);
        
        return clone;
    }
    
    /**
     * Loads the global and app extensions from the given labor configuration.
     * Note: Global extensions are only loaded if the core context outs itself as running in a "worker" process
     * @param context
     * @protected
     */
    protected async loadExtensions(context: WorkerContext): Promise<void>
    {
        const coreContext = context.parentContext;
        
        // Only load the "global" extensions if we are in a separate worker process
        if (coreContext.process === 'worker') {
            await context.extensionLoader
                         .loadExtensionsFromDefinition(
                             'global', coreContext, coreContext.options);
        }
        
        await coreContext.extensionLoader
                         .loadExtensionsFromDefinition('app', context, context.app);
    }
    
    /**
     * Applies the app definition schema to the apps defined in the labor config
     * @param context
     */
    protected async applyAppSchema(context: WorkerContext): Promise<void>
    {
        const args = await context.eventEmitter.emitHook(EventList.FILTER_APP_DEFINITION_SCHEMA, {
            schema: AppDefinitionSchema,
            context,
            app: cloneList(context.app)
        });
        
        // Don't validate the entry and output options
        if (context.parentContext.options.noEntryOutputValidation) {
            delete args.schema.entry;
            delete args.schema.output;
        }
        
        context.app = makeOptions(context.app, args.schema, {allowUnknown: true});
    }
    
    /**
     * Applys app specific configuration to the new context instance
     * @param context
     * @protected
     */
    protected applyAppConfig(context: WorkerContext): void
    {
        if (isArray(context.app.additionalResolverPaths)) {
            forEach(context.app.additionalResolverPaths, path => {
                context.parentContext.paths.additionalResolverPaths.add(path);
            });
        }
    }
}