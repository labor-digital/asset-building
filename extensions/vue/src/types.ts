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
 * Last modified: 2021.03.29 at 21:50
 */

import type {IAppDefinition} from '../../../dist/Core/types';

export interface IVueAppDefinition extends IAppDefinition
{
    useSsr: boolean
    useCssExtractPlugin: boolean
    ssrWorker?: 'server' | 'client'
}

export enum VueIdentifiers
{

}

export enum VueEventList
{
    /**
     * The hook is emitted on every run, but effectively used only if you are running
     * in an SSR environment. It allows you to filter the regex that is used to allow
     * node_module files that can be build by webpack, everything else is directly loaded
     * from the node_modules directory on your server
     *
     * Arguments:
     *    - allowList: the current regex we should use to find allowed files
     */
    SSR_EXTERNAL_ALLOW_LIST_FILTER = 'vueJs__externalAllowList--filter'
}