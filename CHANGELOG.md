# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
## [3.2.2] - 2019-02-06
### Changed
- Converted all dependency versions to absolute numbers
- Updates typescript 

## [3.2.1] - 2019-02-06
### Fixed
- Fixed an issue in MiscFixes.js where chalk was not required correctly
- Fixed an issue in customSassLoader when working with vue files where the file extension was not correctly added based on the style's lang attribute

### Changed
- Changed the way how assets are named when watching the files to prevent memory leaks

## [3.2.0] - 2019-02-05
### Added
- Created a new, dedicated "ResourceLoader" for css superscript global imports

### Changed
- Stripped out the ResourceLoader from CustomSassLoader
- Updated documentation for Resource loader
- Rewrote custom sass loader to be a lot slimmer, faster and better integrated into webpacks build process

### REMOVED
- BREAKING CHANGE: Removed the component loader
- Removed eslint completely
- Removed a lot of old chunk/helpers that was no longer required

## [3.1.6] - 2019-01-30
### Added
- Added additional eslint objects to avoid errors

## [3.1.5] - 2019-01-29
### Changed
- Removed custom sass loader's css-loader bridge, as the latest version of css-loader is no longer incredibly slow when it comes to resolving urls...

## [3.1.4] - 2019-01-29
### Added
- Added WebpackFilterWarningsPlugin to allow our script to remove warnings we don't care for
which will cause the script to fail, tho.

### Changed
- Updates dependencies to the latest versions

## [3.1.3] - 2019-01-11
### Fixed
- Removed requirement of "to" configuration when defining a copy configuration

## [3.1.2] - 2019-01-10
### Changed
- Changed the way how the customSassLoader passes it's result around the webpack css post processor to incorporate other loaders like vue-loader...

### Fixed
- Fixed an issue in customSassLoader which lead to a crash when an empty sass file was compiled
- Added otf to font list 

## [3.1.1] - 2019-01-10
### Fixed
- Fixed an issue with postCss which lead to a console warning

## [3.1.0] - 2019-01-08
### Added
- Added ["autoprefixer"](https://github.com/postcss/autoprefixer) as sass/less/css postprocessor which makes the definition of browser-prefixes obsolete
- Added new hook "postCssPluginFilter"
- Added new hook "browserListFilter"

## [3.0.2] - 2018-12-20
### Added
- Added new hook "filterLoaderConfig"
- Added new hook "filterLoaderTest"
- Added new hook "filterPluginConfig"
- Added new hook "customSassLoaderFileExtensionFallback"
- Added stripOffQuery method to FileHelpers

### Changed
- Makes sure that every path in context.dir.additionalResolverPaths ends with a slash
- Rework of the "CssLoaderProcessCssWrapper" hack, so that the css-loader can be resolved even in the project's root nodeModules
- Changed the context / config transfer to customSassLoader
- FileHelpers.getFileExtension() now trims of the query string correctly
- SassHelpers.preParseSass() now gets the entry sass file's content as injected code, instead of loading it by itself to make it compatible with other loaders, like vue-loader
- Renamed component "ProviderPlugin.js" to "ProvidePlugin.js"
- Renamed component "MinChunkSize.js" to "MinChunkSizePlugin.js"

### Fixed
- Fixed an issue with sass2css when using empty conditionals

## [3.0.1] - 2018-12-18
### Added
- Added HtmlWebpackPlugin for easy creation of html base files
- Added new hook "filterHtmlTemplate" 
- Added new hook "alternativeCompiler" 
- Added new hook "filterExcludePattern" 
- Added check to hide "hot-reload" files in callback outputs
- Added HtmlPlugin.js component
- Added additionalResolverPaths to Dir

### Changed
- Every plugin now adds it's own additionalResolverPath to make sure all external dependencies and loaders can be resolved without problem

### Removed
- Removed Vue.js environment from the core

## [3.0.0] - 2018-12-14
### Changed
- Major refactoring to simplify the cluttered code
- Added a legacy adapter to simulate an app based config for the config version 1
- There are no longer two different config builders, but one that handles the remaining
few exceptions of config version 1 over config version 2
- Splits up the config builder into multiple components that are executed after eachother to create the whole webpack config.
- Removed some npm dependencies that were no longer required

### Added
- Added the concept of "Environments" which can be used to preconfigure webpack for frameworks like vuejs. This allows for further expansion to other frameworks if required.

## [2.1.12] - 2018-12-10
### Fixed
- Fixes config for WebpackConfigBuilder_1 (crypto and minor typo)

## [2.1.11] - 2018-11-26
### Fixed
- Fixes a invalid character in WebpackPromiseShimPlugin that broke the building process

## [2.1.10] - 2018-11-26
### Changed
- The script will now automatically generate jsonp function names for every app configured
to prevent issues when multiple bundles are used on the same website
- Removed module.export and define() loaders from WebpackPromiseShimPlugin() to make sure we don't collide with require.js

### Fixed
- Fixed an issue with the componentLoader that occurend when no sass files were found

## [2.1.9] - 2018-11-19
### Fixed
- Fixed an issue with customSassLoader when data urls where used

## [2.1.8] - 2018-11-08
### Fixed
- Fixed some issues when files were deleted while webpack ran in "watch" mode. 

## [2.1.7] - 2018-10-26
### Added
- If the script is not called in "watch" mode, it will now return an error code 1 if an error occured
- Added new hook "filterJsPreLoaders" which is called when the js stack is collected
- Added exports-loader as requirement so it is usable in code requests

### Fixed
- Fixed an issue in sassPreParser that occured if multiple @import statements followed each other with spaces at the beginning of the line

## [2.1.6] - 2018-10-24
### Added
- Added minor logic to WebpackConfigBuilder_2 to let the script figure out
the most likely publicPath if none is given

### Changed
- Changed typescript version requirement to make eslint happy
- Readded exclude on js loaders of builder version 1 to make sure no node_module sources are parsed
- Changed WebpackFixBrokenChunkPlugin so that \_\_webpack_require__.e() returns a Promise.resolve() object

### Fixed
- Finally fixed the issue, that broke css compiling when using empty sass selectors 

## [2.1.5] - 2018-09-26
### Added
- Added .npmignore
- Added output hash to all bundle files, except the base files - version 2.0

## [2.1.4] - 2018-09-26
### Added
- Added default configuration for image optimization - version 2.0
- Added a small plugin to automatically "add" all emitted output files to the current git repository - version 2.0

## [2.1.3] - 2018-09-25
### Fixed
- Fixed an issue where the sassPreParser removed linebreaks before an @import which 
caused the import statement to be ignored if it was placed after a block comment

## [2.1.2] - 2018-09-24
### Changed
- Adds imports-loader dependency
- Adds "FormData" to EsLint globals
### Fixed
- Fixes some parts where documentation was outdated.
- Disables the "no-undef" eslint rule for typescript, because it crashes otherwise.

## [2.1.1] - 2018-09-21
### Fixed
- Readme lists where not correctly parsed on bitbucket.org
- Sets ts-loader module resolution to "esnext" to prevent it breaking dynamic imports.

## [2.1.0] - 2018-09-21
### Added
- Removes [hash] from chunkfile names
- Adds a wrapper around node's module loader to make sure we can load all es lint plugins correctly
- Adds internal "custom-sass-loader" to speed up the compiling process
- Adds internal "component-loader" to import components more efficently and to resolv url()s correctly
- Adds "image-webpack-loader" to shrink image assets when building for production.
- Adds windows wrapper cmd to increase the memory limit of node
- Adds a hacky bridge to "css-loader" to speed up css compilation
- Adds typescript loader
- Adds progress bar plugin vor version 2.0

### Changed
- minChunkSize can now be set to 0 to disable the feature
- Removes unused node modules
- Removes resource loader and wildcard loader
- Removes babel compiler

### Fixed
- Adds correct package.json to "demo2" and re-renames package.json in "demo"

## [2.0.0] - 2018-09-10
### Added
- Adds new and advanced version 2 config builder 
- Adds documentation for version 2 config builder
- Adds entity classes for better autocompletion 
- Adds custom webpack plugins / loaders for version 2

### Changed
- Breaks up version 1 config builder into multiple smaller parts
- Makes esLint config more readable
- Major refactoring of code into smaller chunks 

## [1.1.8] - 2018-09-06
### Added
- Adds occured errors to the new compiler output
- Adds mini information as last line to new compiler output (keep your terminal tiny and see changes)
- Adds support for "copy" configuration to define your "from" rules as a node module. "@labor/myModule/something/*.js" will autoresolve to the node_modules directory

## [1.1.7] - 2018-09-04
### Added
- Adds a new possible hook "compilingDone" which is called every time the controller's callback is executed
- Adds a function wrapper to webpacks "writeFile" method to make sure compiled css files will not be overwritten by the useless .js file created by webpack

### Changed
- Different implementation of UglifyJsPlugin using webpackConfig.optimization.minimizer instead of webpackConfig.plugins for better results.
- ConfigBuilder now returns the context instance instead of the webpackConfig
- Moves the "callPluginMethod" function to be a context method instead a function
- Removes "last-call-webpack-plugin" from the list of dependencies
- Changes the way how css files are built by dropping/rewriting files our new "writeFile" handler 
- Changes the compiler output to contain less irrelevant information

### Fixed
- Fixed the creation of yourname.css.pseudo.css files 
- Fixes an issue that caused the css sourcemaps to be empty
- Fixes an issue where css sourcemaps could not be found because their path's where defined like yourname.css.pseudo.css.map instead of yourname.css.map.

## [1.1.6] - 2018-08-30
### Added
- Adds new js config option to specify allowed node_modules to be included in the babel compiling
- Adds changelog file
- Additional documentation in the readme

### Changed
- Disables babel node_module compiling again, as there where issues with external libraries.

## [1.1.5] - 2018-08-29
### Changed
- Allows babel node_modules compiling, without allowing babel to compile itself

## [1.1.4] - 2018-08-24
### Added
- Adds new feature which helps webpack to keep running if there are no js/css entry points given when it otherwise would simply crash

### Changed
- Disables webpack whining over big file sizes
- Allows plugin resolution like everywhere else in node by just defining the package name and the plugin

## [1.1.3] - 2018-08-24
### Added
- Finishes up readme.md

### Fixed
- Fixes an issue with less-loader mangling our file url path's

## [1.1.2] - 2018-08-23
### Changed
- Makes the git path ssh instead of https

## [1.1.1] - 2018-08-23
### Added
- Adds git repository to package.json
- Adds flags for eslint
- Adds url=false for css-loader
- Adds compact flag to babel

## [1.1.0] - 2018-08-23
### Added
- Adds babel transform runtime to make sure polyfills for Promises and other es6 stuff exist
- Adds resolving paths for loaders from the asset-buidling node-modules
- Adds @labor scope to package.json

### Changed
- Minor adjustments to make js uglifier work better with babel

### Fixed
- Fixes an issue when using urls in css files -> compiler could not resolve them -> urls disabled

## [1.0.0] - 2018-08-15
### Added 
- Documentation
- Finishes up basic implementation
- Adds demo files to describe how stuff works

### Fixed 
- Fixes a lot of minor problems which caused the script not to run properly

## [0.0.1] - 2018-08-09
### Added
- Initial commit added all basic files



The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).
