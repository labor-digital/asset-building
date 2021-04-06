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
 * Last modified: 2019.10.06 at 16:20
 */

export enum ConfiguratorIdentifier
{
    BASE = 'conf:base',
    APP_PATHS = 'conf:appPaths',
    POLYFILL = 'conf:polyfill',
    DEV_ONLY = 'conf:devOnly',
    PROD_ONLY = 'conf:prodOnly',
    HTML = 'conf:html',
    IMAGES = 'conf:images',
    FONTS = 'conf:fonts',
    JS_PRE = 'conf:jsPre',
    TS = 'conf:typescript',
    JS_COMPAT = 'conf:jsCompatLoader',
    LESS = 'conf:lessLoader',
    SASS = 'conf:sassLoader',
    CSS_EXTRACT = 'conf:cssExtract',
    PROVIDE = 'conf:provide',
    COPY = 'conf:copy',
    CLEAN_OUTPUT_DIR = 'conf:cleanOutputDir',
    MIN_CHUNK_SIZE = 'conf:minChunkSize',
    FILTER_WARNINGS = 'conf:filterWarnings',
    BUNDLE_ANALYZER = 'conf:bundleAnalyzer',
    BUILT_IN_PLUGIN = 'conf:builtIn',
}

export enum RuleIdentifier
{
    HTML = 'rule:html',
    IMAGE = 'rule:image',
    IMAGE_SVG = 'rule:image:svg',
    FONT = 'rule:font',
    JS_PRE = 'rule:js:pre',
    JS_COMPAT = 'rule:js:pre',
    TS = 'rule:ts',
    LESS = 'rule:less',
    SASS = 'rule:sass',
}

export enum LoaderIdentifier
{
    FILE = 'loader:file',
    HTML = 'loader:html',
    IMPORTS = 'loader:imports',
    URL = 'loader:url',
    URL_SVG = 'loader:url:svg',
    IMAGE_OPTIMIZATION = 'loader:imageOptimization',
    CSS = 'loader:css',
    TS = 'loader:ts',
    LESS = 'loader:less',
    SASS = 'loader:sass',
    STYLE_RESOURCE = 'loader:style:resource',
    STYLE_LAST = 'loader:style:resource',
    POST_CSS = 'loader:postCss',
}

export enum PluginIdentifier
{
    PROGRESS_BAR = 'plugin:progressBar',
    TS_CHECK = 'plugin:ts:check',
    CSS_EXTRACT = 'plugin:css:extract',
    PROVIDE = 'plugin:provide',
    COPY = 'plugin:copy',
    CLEAN_OUTPUT_DIR = 'plugin:cleanOutputDir',
    MIN_CHUNK_SIZE = 'plugin:minChunkSize',
    FILTER_WARNINGS = 'plugin:filterWarnings',
    CSS_UGLIFY = 'plugin:js:uglify',
    JS_UGLIFY = 'plugin:css:uglify',
    HTML_TEMPLATE = 'plugin:html:template',
    BUNDLE_ANALYZER = 'plugin:bundleAnalyzer',
    FANCY_STATS = 'plugin:fancyStats',
    PROMISE_SHIM = 'plugin:promiseShim',
    GIT_ADD = 'plugin:gitAdd',
    PROGRESS_PROVIDER = 'plugin:progressProvider',
    EVENT_PROVIDER = 'plugin:eventProvider'
}

export type Identifier = ConfiguratorIdentifier | RuleIdentifier | PluginIdentifier | string;