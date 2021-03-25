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
 * Last modified: 2019.10.04 at 23:53
 */

import {isString, PlainObject} from '@labor-digital/helferlein';

let fallbackAppCounter = 0;
const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

export default {
    disabled: {
        type: 'bool',
        default: false
    },
    verboseResult: {
        type: 'bool',
        default: false
    },
    appName: {
        type: 'string',
        default: (_: any, data: PlainObject) => {
            return 'App - ' + (data.id ?? chars[fallbackAppCounter++] ?? 'X');
        }
    },
    entry: {
        type: ['string']
    },
    output: {
        type: ['string']
    },
    publicPath: {
        type: ['string', 'null'],
        default: null
    },
    publicPathDev: {
        type: ['string', 'null'],
        default: null
    },
    polyfills: {
        type: ['array', 'false', 'null'],
        default: null
    },
    useTypeChecker: {
        type: 'bool',
        default: false
    },
    minChunkSize: {
        type: 'number',
        default: 10000,
        validator: (v: number) => {
            return !(v < 0);
        }
    },
    jsCompat: {
        type: ['array', 'null'],
        default: null
    },
    keepOutputDirectory: {
        type: 'bool',
        default: false
    },
    disableGitAdd: {
        type: 'bool',
        default: false
    },
    imageCompression: {
        type: 'bool',
        default: true
    },
    imageCompressionQuality: {
        type: 'number',
        default: 80,
        validator: (v: number) => {
            return v > 0 && v <= 100;
        }
    },
    htmlTemplate: {
        type: ['null', 'plainObject', 'true'],
        default: null
    },
    webpackConfig: {
        type: ['undefined', 'string', 'plainObject', 'true'],
        default: undefined
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
    }
};