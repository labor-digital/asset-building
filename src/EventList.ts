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
 * Last modified: 2019.10.04 at 14:36
 */

export enum EventList
{
    // Events for global extensions
    
    SHUTDOWN = 'assetBuilder__shutdown',
    GET_MODES = 'assetBuilder__getModes',
    GET_MODE = 'assetBuilder__getMode',
    IS_PROD = 'assetBuilder__isProd',
    AFTER_MAIN_INIT_DONE = 'assetBuilder__afterMainInitDone',
    
    // Events for global and app-based extensions
    FILTER_APP_DEFINITION_SCHEMA = 'assetBuilder__filterAppDefinition',
    AFTER_WORKER_INIT_DONE = 'assetBuilder__afterWorkerInitDone',
    BEFORE_CONFIGURATOR = 'assetBuilder__beforeConfigurator',
    AFTER_CONFIGURATOR = 'assetBuilder__afterConfigurator',
    FILTER_RULE_CONFIG = 'assetBuilder__filterRuleConfig',
    FILTER_RULE_USE_LIST = 'assetBuilder__filterRuleUse',
    FILTER_LOADER_CONFIG = 'assetBuilder__filterLoaderConfig',
    AFTER_LOADER_CONFIG_ADDED = 'assetBuilder__afterLoaderConfigAdded',
    FILTER_LAST_MINUTE_STYLE_LOADERS = 'assetBuilder__filterSecondToLastStyleLoader',
    FILTER_LAST_STYLE_LOADER = 'assetBuilder__filterLastStyleLoader',
    FILTER_RULE_TEST = 'assetBuilder__filterLoaderTest',
    FILTER_PLUGIN_CONFIG = 'assetBuilder__filterPluginConfig',
    FILTER_POLYFILLS = 'assetBuilder__filterJsPolyfills',
    GET_JS_PROVIDES = 'assetBuilder__getJsProvides',
    FILTER_JS_PRE_LOADERS = 'assetBuilder__filterJsPreLoaders',
    FILTER_JS_EXCLUDE_PATTERN = 'assetBuilder__filterJsExcludePattern',
    FILTER_POSTCSS_PLUGINS = 'assetBuilder__filterPostcssPlugins',
    FILTER_BROWSER_LIST = 'assetBuilder__filterBrowserList',
    FILTER_WARNING_TO_IGNORE_PATTERNS = 'assetBuilder__filterWarningsToIgnore',
    FILTER_HTML_PLUGIN_TEMPLATE = 'assetBuilder__filterHtmlTemplate',
    APPLY_EXTENSION_WEBPACK_CONFIG = 'assetBuilder__applyExtensionWebpackConfig',
    FILTER_WEBPACK_CONFIG = 'assetBuilder__filterWebpackConfig',
    FILTER_WEBPACK_COMPILER = 'assetBuilder__filterWebpackCompiler',
    COMPILING_DONE = 'assetBuilder__compilingDone',
    BEFORE_GIT_ADD = 'assetBuilder__beforeGitAdd',
    PROCESS_CREATED = 'assetBuilder__processManager--processCreated',
    CHECK_IDENTIFIER_STATE = 'assetBuilder__checkIdentifierState',
    
    // Special Interop events
    /**
     * Emitted when an interop package built a webpack config, can be used by extensions
     * to perform additional actions for interop contexts
     *
     * Arguments:
     * - environment: type of the interop environment
     * - context: used worker context
     * - config: the built webpack config to filter
     */
    INTEROP_WEBPACK_CONFIG = 'assetBuilder__interop--webpackConfig',
    
    /**
     * Allows you to filter the file extensions that should be externalized in a (nuxt/vue) application.
     * Those files will not be processed by webpack but directly included on the server side
     */
    INTEROP_VUE_EXTERNAL_EXTENSION_PATTERN = 'assetBuilder__interop--vueExternalExtensionPattern',
    
    // Additional loader events
    SASS_LOADER_FILE_EXTENSION_FALLBACK = 'customSassLoader__fileExtensionFallback',
    
    // INTERNAL EVENTS
    EXTENSION_LOADING = 'assetBuilder__internal--extensionLoading',
    CUSTOM_WEBPACK_CONFIG_LOADING = 'assetBuilder__internal--customWebpackConfigLoading'
}