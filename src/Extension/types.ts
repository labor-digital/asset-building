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
 * Last modified: 2021.03.29 at 20:47
 */

import type {EventEmitterEvent, EventEmitterEventListener, PlainObject} from '@labor-digital/helferlein';

export interface IExtensionConfig
{
    /**
     * Default: true, If false, the script throws an error if the extension was registered "globally"
     */
    allowGlobalRegistration?: boolean
    
    /**
     * Default: true, if false, the script throws an error if the extension was registered for a single "app"
     */
    allowAppRegistration?: boolean
    
    /**
     * Default: true, if false, if the extension was registered globally it will NOT run in the "core" process, but ONLY in the apps.
     */
    runInCoreProcess?: boolean
    
    /**
     * Default: true, if false, if the extension was registered globally it will ONLY run in the "core" process, but NOT in the apps.
     */
    runInWorkerProcess?: boolean
    
    /**
     * A list of custom event handlers by their event id. This allows you to hook directly into the config generation.
     * This is exactly the same as doing this.addListener() yourself.
     */
    events?: PlainObject<EventEmitterEventListener>
}

export interface IExtensionEventListener
{
    (evt: EventEmitterEvent): void | Promise<void> | any;
}