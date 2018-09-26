# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
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
