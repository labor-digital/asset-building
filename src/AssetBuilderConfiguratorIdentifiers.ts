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
export enum AssetBuilderConfiguratorIdentifiers
{
    BASE = 'base',
    APP_PATHS = 'appPaths',
    POLYFILL = 'polyfill',
    DEV_ONLY = 'devOnly',
    PROD_ONLY = 'prodOnly',
    PROGRESS_BAR_PLUGIN = 'progressBarPlugin',
    HTML_LOADER = 'htmlLoader',
    IMAGE_LOADER = 'imageLoader',
    SVG_IMAGE_LOADER = 'svgImageLoader',
    FONT_LOADER = 'fontLoader',
    JS_PRE_LOADER = 'jsPreLoader',
    TYPESCRIPT_LOADER = 'typescriptLoader',
    JS_COMPAT_LOADER = 'jsCompatLoader',
    LESS_LOADER = 'lessLoader',
    SASS_LOADER = 'sassLoader',
    POST_CSS_LOADER = 'postCssLoader',
    CSS_EXTRACT_PLUGIN = 'cssExtractPlugin',
    PROVIDE_PLUGIN = 'providePlugin',
    COPY_PLUGIN = 'copyPlugin',
    CLEAN_OUTPUT_DIR_PLUGIN = 'cleanOutputDirPlugin',
    MIN_CHUNK_SIZE_PLUGIN = 'minChunkSizePlugin',
    FILTER_WARNINGS_PLUGIN = 'filterWarningsPlugin',
    JS_UGLIFY_PLUGIN = 'jsUglifyPlugin',
    CSS_UGLIFY_PLUGIN = 'cssUglifyPlugin',
    BUNDLE_ANALYZER_PLUGIN = 'bundleAnalyzerPlugin',
    HTML_PLUGIN = 'htmlPlugin',
    BUILT_IN_PLUGIN = 'builtInPlugin'
}
