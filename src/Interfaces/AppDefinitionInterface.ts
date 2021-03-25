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
 * Last modified: 2019.10.04 at 19:21
 */

import type {PlainObject} from '@labor-digital/helferlein';
import type {RuleSetRule} from 'webpack';

export interface AppCopyDefinition
{
    from: string;
    to: string;
    inBuildOnly?: boolean;
    context?: string;
}

export interface AppDefinitionInterface extends PlainObject
{
    
    /**
     * If this is set to true, the app will not be build.
     */
    disabled?: boolean;
    
    /**
     * If this is set to true the callback result/summary will be rendered verbosely
     */
    verboseResult?: boolean;
    
    /**
     * A unique number to identify this app with
     */
    id?: number;
    
    /**
     * A speaking name for this app
     */
    appName?: string;
    
    /**
     * A list of configuration extensions that should be used on an app scale.
     * The extension definition should be a file path that can be resolved by node.js.
     * The extension should be a function that is exported as default. The function will be called once for
     * every time it is registered as extension
     */
    extensions?: Array<string>;
    
    /**
     * The file that should be used as entry point to this app
     */
    entry: string;
    
    /**
     * The file name that should be used as output bundle base name for this app
     */
    output: string;
    
    /**
     * The public path / the public url path to the bundle file when the
     * bundle is included by the html file.
     */
    publicPath?: string;
    
    /**
     * Similar to publicPath but is only active in development mode
     */
    publicPathDev?: string;
    
    /**
     * A regex pattern of warnings that should be ignored for this app
     */
    warningsIgnorePattern?: string | Array<string>;
    
    /**
     * An additional webpack config object to merge into the configuration
     */
    webpackConfig?: PlainObject | string | true;
    
    /**
     * The list of copy definitions we have to perform for this app
     */
    copy?: Array<AppCopyDefinition>;
    
    /**
     * The list of polyfills to use for the generated app bundle.
     * If this is set to false, no polyfills will be injected
     */
    polyfills?: Array<string> | false;
    
    /**
     * Defines the number of bytes a chunk has to have before it will be extracted into its own file.
     * This is 10kb by default.
     */
    minChunkSize?: number;
    
    /**
     * By default we use ts-loader's "transpileOnly" option to save a lot of time while compiling your scripts.
     * If you want to use the typescript-typeChecker set this option to true.
     */
    useTypeChecker?: boolean;
    
    /**
     * Additional definitions for the imports-loader
     */
    jsCompat?: Array<{ rule: string, fix?: string, options?: RuleSetRule }>
    
    /**
     * If this is set to true we will keep the output directory of this app when we build the sources
     */
    keepOutputDirectory?: boolean;
    
    /**
     * We will add the built sources automatically to git by default.
     * Set this to false to disable that feature
     */
    disableGitAdd?: boolean;
    
    /**
     * If this is true webpack will compress images while building the bundle,
     * if this is false we will just pass through images
     */
    imageCompression?: boolean;
    
    /**
     * If "imageCompression" is used this option defines the image quality we should
     * shrink the images to. Default is 80% Range 0-100
     */
    imageCompressionQuality?: number;
    
    /**
     * Additional configuration for the html webpack plugin
     */
    htmlTemplate?: PlainObject | true;
    
    /**
     * Additional, configured lookup paths to find imports in
     * These are used by require() to resolve node modules
     */
    additionalResolverPaths?: Array<string>;
}