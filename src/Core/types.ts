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
 * Last modified: 2021.03.26 at 18:58
 */

import type {PlainObject} from '@labor-digital/helferlein';
import type {RuleSetRule} from 'webpack';

export type TBuilderMode = 'production' | 'dev' | 'analyze' | string;
export type TBuilderEnvironment = 'standalone' | 'nuxt' | 'express' | 'storybook' | string;

export interface IBuilderOptions
{
    /**
     * The absolute path to the working directory.
     * If omitted process.cwd() is used
     */
    cwd?: string;
    
    /**
     * A valid mode to boot the asset builder with
     * "production" to build the script as a production ready bundle
     * "dev" to build the bundle with a (much faster) development mode
     * "analyze" to run the webpack bundle analyzer
     * @see https://asset-building.labor.tools/guide/CoreFeatures.html#commands-modes
     */
    mode?: TBuilderMode;
    
    /**
     * If set to true, the asset builder will try to start a dev server for you
     */
    devServer?: boolean;
    
    /**
     * If set to true, additional console outputs will be generated while the builder runs
     */
    verbose?: boolean;
    
    /**
     * If set to true, webpack will run in watch mode
     */
    watch?: boolean;
    
    /**
     * A speaking identifier to allow the configurator to see from which context it was instantiated.
     * This can be something like "storybook", "nuxt", "express", a custom string or "standalone" if omitted
     */
    environment?: TBuilderEnvironment;
    
    /**
     * The absolute path to a package.json from which we should load the "apps" and "extensions" options.
     * If the file does not exist, the script will fail. If set to false, the asset builder will not try
     * to find a package.json
     */
    packageJsonPath?: string | false
    
    /**
     * The list of apps that is used in the configuration builder
     */
    apps?: Array<IAppDefinition>;
    
    /**
     * Can be either:
     * a.) a numeric index of an app (in this.apps) to build, or
     * b.) an app definition object defining a single app.
     */
    app?: number | IAppDefinition;
    
    /**
     * A list of configuration extensions that should be used on a global scale.
     * The extension definition should be a file path that can be resolved by node.js.
     * The extension should be a function that is exported as default.
     * If the SAME extension is registered twice in the same list, or on global AND app scale,
     * it will only be called ONCE!
     */
    extensions?: Array<string>;
    
    /**
     * Additional, configured lookup paths to find imports in
     * These are used by require() to resolve node modules
     */
    additionalResolverPaths?: Array<string>;
    
    /**
     * By default the core context will be cloned to prevent pollution if you work with custom instances.
     * This, however means it will no longer be available on your given references. If you set this to FALSE
     * the original context will be kept and not cloned, modifying the given instance. I can see some edge cases
     * where this will come in handy...
     */
    cloneCoreContext?: boolean;
    
    /**
     * If set to true, the app definition will not validate the entry or output configuration.
     * This can be useful if you create the builder for services that already create their own entry point
     */
    noEntryOutputValidation?: boolean;
}

export interface IPathList
{
    /**
     * The path to the source directory
     */
    source: string;
    
    /**
     * The directory of the asset builder
     */
    assetBuilder: string;
    
    /**
     * The absolute path to the node modules inside the working directory path
     */
    nodeModules: string;
    
    /**
     * The absolute path to the asset-building's node modules
     */
    buildingNodeModules: string;
    
    /**
     * Is used to store additional paths that should be used for node and webpack file resolution
     * in addition to the default node_modules directory
     */
    additionalResolverPaths: Set<string>;
}

export interface IAppCopyDefinition
{
    from: string;
    to: string;
    inBuildOnly?: boolean;
    context?: string;
}

export interface IAppDefinition
{
    /**
     * If this is set to true, the app will not be build.
     */
    disabled?: boolean;
    
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
    copy?: Array<IAppCopyDefinition>;
    
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
     * If set, the path to the tsconfig.json to use instead of the bundled default config
     */
    tsConfig?: string | true;
    
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
    
    /**
     * Options for the dev server specific to this app
     */
    devServer?: {
        /**
         * By default 8888 +n when the port is already taken
         * Allows you to force the port to be the one you specify here.
         */
        port?: number;
        
        /**
         * By default "localhost", can be set to any other url that resolves to localhost, too.
         */
        host?: string;
    }
}