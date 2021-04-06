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
 * Last modified: 2021.03.30 at 01:23
 */

import type {ExpressContext} from '@labor-digital/asset-building';
import {Bootstrap} from './Bootstrap';
import type {IExpressSsrOptions} from './types';

export default function (context: ExpressContext, options?: IExpressSsrOptions): Promise<ExpressContext> {
    global.EXPRESS_VUE_SSR_MODE = true;
    return (new Bootstrap(context, options)).boot();
}