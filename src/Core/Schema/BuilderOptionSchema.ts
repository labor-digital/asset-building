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
 * Last modified: 2021.03.26 at 19:15
 */

import {isString} from '@labor-digital/helferlein';
import path from 'path';

export default {
    cwd: {
        type: 'string',
        default: () => process.cwd(),
        filter: (v: string) => path.normalize(v)
    },
    mode: {
        type: 'string',
        default: 'production'
    },
    devServer: {
        type: 'boolean',
        default: false
    },
    watch: {
        type: 'boolean',
        default: false
    },
    verbose: {
        type: 'boolean',
        default: false
    },
    appEntryOutputValidation: {
        type: 'boolean',
        default: true
    },
    environment: {
        type: 'string',
        default: 'standalone'
    },
    packageJsonPath: {
        type: 'string',
        default: ''
    },
    laborConfig: {
        type: ['plainObject', 'undefined'],
        default: undefined
    },
    apps: {
        type: 'array',
        default: () => []
    },
    app: {
        type: ['number', 'undefined', 'plainObject'],
        default: undefined
    },
    extensions: {
        type: 'array',
        default: () => []
    },
    additionalResolverPaths: {
        type: ['undefined', 'array', 'string'],
        default: undefined,
        filter: function (v: string | undefined | Array<any>) {
            if (isString(v)) {
                return [v];
            }
            return v;
        }
    },
    dependencies: {
        type: 'PlainObject',
        default: () => { return {};},
        children: {
            webpack: {
                type: 'string',
                default: 'webpack'
            }
        }
    }
};