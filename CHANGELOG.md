# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.14.0](https://github.com/labor-digital/asset-building/compare/v4.13.0...v4.14.0) (2020-05-13)


### Features

* update dependencies ([00b33cd](https://github.com/labor-digital/asset-building/commit/00b33cdcea6197f7b07f1f2707263ac82976941d))

## [4.13.0](https://github.com/labor-digital/asset-building/compare/v4.12.0...v4.13.0) (2020-04-24)


### Features

* **Interop:** add INTEROP_WEBPACK_CONFIG event to allow extension to filter the webpack config before they are passed to the third party software ([03af9b9](https://github.com/labor-digital/asset-building/commit/03af9b91bff6e1ed08b6ef8d0b6ca6675f61421d))


### Bug Fixes

* make sure all exclude patterns have the correct definition ([62b4013](https://github.com/labor-digital/asset-building/commit/62b40138ff8c561f4680301dbf741b809cc6a8a0))

## [4.12.0](https://github.com/labor-digital/asset-building/compare/v4.11.1...v4.12.0) (2020-04-24)


### Features

* **Express:** move express interop functionallity to "Interop" ([4b98bde](https://github.com/labor-digital/asset-building/commit/4b98bdec32f248c251310bac2fe4ab2e1493e948))
* **Storybook:** implement storybook interop functionality ([e2494b9](https://github.com/labor-digital/asset-building/commit/e2494b9d298b52939bf8e498f5d561398dc0e8dd))
* add new configuration option for additional resolver paths ([49db7e8](https://github.com/labor-digital/asset-building/commit/49db7e8091e73a6c506ebfd7d8835c0626aaf811))
* implement factory and addon definition to run the asset builder as StoryBook addon ([c615369](https://github.com/labor-digital/asset-building/commit/c615369a8f8e37e65c608a099d92e26d23ef8fa7))
* update dependencies ([7146e90](https://github.com/labor-digital/asset-building/commit/7146e903046f093d5d8e23f00b6c2b9c697cd89d))


### Bug Fixes

* **CustomSassLoader:** make sass include file resolution more reliable ([e47b919](https://github.com/labor-digital/asset-building/commit/e47b9191fb8ade5ef08c82bc9d7ef3b710bb14cf))
* **Interop:** make sure the correct root directory is used after express interop move ([e1d7d83](https://github.com/labor-digital/asset-building/commit/e1d7d8310052b49390c03cccdedd720d9d86bd06))
* **WebpackConfigGenerator:** make sure that the webpackConfig: true option correctly loads the webpack.config.js file ([0ee86f0](https://github.com/labor-digital/asset-building/commit/0ee86f0c8bbe64d804950f868b8546e571a0c928))

### [4.11.1](https://github.com/labor-digital/asset-building/compare/v4.11.0...v4.11.1) (2020-04-13)

## [4.11.0](https://github.com/labor-digital/asset-building/compare/v4.10.0...v4.11.0) (2020-04-11)


### Features

* update dependencies + remove chokidar ([08e3030](https://github.com/labor-digital/asset-building/commit/08e3030cae5aa33fcbcd089ff5697af13b93def0))


### Bug Fixes

* make sure custom sass loader cache is cleared when a file is changed ([3a8ecf8](https://github.com/labor-digital/asset-building/commit/3a8ecf818d8e3a2ddc57aa83af0ba262e972b557))

## [4.10.0](https://github.com/labor-digital/asset-building/compare/v4.9.3...v4.10.0) (2020-03-13)


### Features

* update dependencies ([7e0ed35](https://github.com/labor-digital/asset-building/commit/7e0ed35dff2f7800e9fa79f1071b8ffd7ac34e87))

### [4.9.3](https://github.com/labor-digital/asset-building/compare/v4.9.2...v4.9.3) (2020-02-18)


### Bug Fixes

* add tsconfig.json back to published npm sources ([5e0a89f](https://github.com/labor-digital/asset-building/commit/5e0a89fa8de511629b5d9e9843d62dd4e58d1919))

### [4.9.2](https://github.com/labor-digital/asset-building/compare/v4.9.1...v4.9.2) (2020-02-17)

### [4.9.1](https://github.com/labor-digital/asset-building/compare/v4.9.0...v4.9.1) (2020-02-17)

## [4.9.0](https://github.com/labor-digital/asset-building/compare/v4.8.0...v4.9.0) (2020-02-17)


### Features

* preparations to move the code to public repository ([745b62b](https://github.com/labor-digital/asset-building/commit/745b62b77f6271cdd93db56f14d0a71b0c800f80))


### Bug Fixes

* ignore css files when handling files with customSass and resource loaders ([514e161](https://github.com/labor-digital/asset-building/commit/514e1610c87ff2c5ed2d0fb986918d9c7111cf37))

# [4.8.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.8.0%0Dv4.7.2#diff) (2020-01-15)


### Features

* **ExpressContext:** add option to add a route for a static directory ([2498317](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/2498317))



## [4.7.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.7.2%0Dv4.7.1#diff) (2020-01-15)


### Bug Fixes

* **ExpressContext:** fix registerPublicAssets not making the correct directory public ([ac4627b](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/ac4627b))



## [4.7.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.7.1%0Dv4.7.0#diff) (2020-01-10)


### Bug Fixes

* **CleanOutputPlugin:** make sure the clean output plugin is running ([83e5a5c](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/83e5a5c))



# [4.7.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.7.0%0Dv4.6.0#diff) (2019-12-23)


### Bug Fixes

* **ProcessManager:** fix typescript issue ([cea920c](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/cea920c))


### Features

* **Express:** add registerPublicAssets helper to express context ([cab764d](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/cab764d))
* update all dependencies ([b879dca](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/b879dca))



# [4.6.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.6.0%0Dv4.5.0#diff) (2019-11-18)


### Features

* add process definition to core context to allow extensions to detect in which process type they are executed ([53e7941](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/53e7941))



# [4.5.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.5.0%0Dv4.4.3#diff) (2019-11-08)


### Features

* update dependencies ([d914d45](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/d914d45))



## [4.4.3](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.4.3%0Dv4.4.2#diff) (2019-10-31)


### Bug Fixes

* **DefaultCompilerCallback:** add BEWARE! message to the output array instead of dumping it to the screen directly ([9c98eb2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/9c98eb2))



## [4.4.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.4.2%0Dv4.4.1#diff) (2019-10-23)


### Bug Fixes

* **CoreFixes:** add correct error output to the event bugfix ([e0ae589](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/e0ae589))



## [4.4.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.4.1%0Dv4.4.0#diff) (2019-10-22)


### Bug Fixes

* **CoreFixes:** fix broken node http library when using our asset builder ([4bc77f6](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/4bc77f6))



# [4.4.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.4.0%0Dv4.3.1#diff) (2019-10-15)


### Features

* automatically enable polling in watch mode when the asset-builder runs in a docker context ([1ef2fd9](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/1ef2fd9))



## [4.3.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.3.1%0Dv4.3.0#diff) (2019-10-15)


### Bug Fixes

* re-add the missing console.log at the end of the default compiler callback ([6504797](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/6504797))



# [4.3.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.3.0%0Dv4.2.0#diff) (2019-10-15)


### Features

* multiple adjustments to implement the express runner better into the core of the asset builder ([d940989](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/d940989))



# [4.2.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.2.0%0Dv4.1.1#diff) (2019-10-15)


### Features

* replaces "CompilerFactory" with ExpressContext and expressAssetBuildingPlugin for a better API in the extensions ([af5e2cf](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/af5e2cf))



## [4.1.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.1.1%0Dv4.1.0#diff) (2019-10-14)


### Bug Fixes

* return correct compiler instance in compilerFactory ([644d59f](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/644d59f))



# [4.1.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.1.0%0Dv4.0.2#diff) (2019-10-14)


### Features

* add "CompilerFactory" class to create the instance of a webpack compiler using a node API ([54b610c](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/54b610c))



## [4.0.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.0.2%0Dv4.0.1#diff) (2019-10-10)


### Bug Fixes

* update to latest package versions + add verboseResult to assetBuilder v1 config ([c00fb4e](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/c00fb4e))



## [4.0.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.0.1%0Dv4.0.0#diff) (2019-10-10)


### Bug Fixes

* **CustomSassLoader:** fix broken error handler in custom sass loader ([5f63d85](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/5f63d85))



# [4.0.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v4.0.0%0Dv3.13.0#diff) (2019-10-09)


### Bug Fixes

* fix minor definition problem in compiler callback ([9990c18](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/9990c18))


### Features

* major rewrite of the application ([973e36a](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/973e36a))


### BREAKING CHANGES

* new API and general incompatibility with the previous
version



# [3.13.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.13.0%0Dv3.12.0#diff) (2019-10-01)


### Features

* copy configurations are now an "per-app" config object when builderVersion 2 is used. The legacy adapter creates automatic copy nodes to support the "first" and "last" flags ([9d9656b](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/9d9656b))



# [3.12.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.12.0%0Dv3.11.2#diff) (2019-09-25)


### Bug Fixes

* disable output directory cleaning for development ([afbf750](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/afbf750))


### Features

* update some dependencies to their latest minor versions ([8c6f9de](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/8c6f9de))



## [3.11.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.11.2%0Dv3.11.1#diff) (2019-09-20)


### Bug Fixes

* Adding some code doc ([9116ddd](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/9116ddd))



## [3.11.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.11.1%0Dv3.11.0#diff) (2019-09-20)


### Bug Fixes

* Fixing first flag in copy ([6232798](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/6232798))



# [3.11.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.11.0%0Dv3.10.1#diff) (2019-09-17)


### Features

* new copy-logic. You´re now able to control, when a yop is processed ([90b9e68](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/90b9e68))



## [3.10.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.10.1%0Dv3.10.0#diff) (2019-09-12)


### Bug Fixes

* changed the wrapping for version 1 legacy scripts to version 2 scripts to be able to build as library ([7c69516](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/7c69516))



# [3.10.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.10.0%0Dv3.9.1#diff) (2019-09-10)


### Bug Fixes

* now using terser-webpack-plugin instead of uglifyJS to address some es6 errors ([3f31891](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/3f31891))


### Features

* webpackConfig can now be an obejct of webpack-settings as well, added webpackConfig to individual js nodes for version 1, added a warningIgnorePattern to ignore certain warnings during the build to prevent an exit code 1 ([676bb8e](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/676bb8e))



## [3.9.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.9.1%0Dv3.9.0#diff) (2019-08-07)


### Reverts

* remove iterator polyfill as it does not work as expected ([3eba250](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/3eba250))



# [3.9.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.9.0%0Dv3.8.0#diff) (2019-08-07)


### Features

* **Polyfill:** Add "Iterator" to list of polyfills ([c83df04](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/c83df04))



# [3.8.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.8.0%0Dv3.7.1#diff) (2019-08-07)


### Features

* **Polyfill:** Add "Symbol" to list of polyfills ([e52fd34](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/e52fd34))



## [3.7.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.7.1%0Dv3.7.0#diff) (2019-08-01)


### Bug Fixes

* **WebpackResolver:** add ./ to list of possible resolver path's ([0823ff5](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/0823ff5))



# [3.7.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.7.0%0Dv3.6.0#diff) (2019-08-01)


### Features

* **Typescript:** add better jsx/tsx support ([e9d1fc6](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/e9d1fc6))
* update dependencies ([daafbc6](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/daafbc6))



# [3.6.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.6.0%0Dv3.5.0#diff) (2019-07-26)


### Features

* add bundle analyzing using npm run analyze ([6bce65c](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/6bce65c))



# [3.5.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.5.0%0Dv3.4.0#diff) (2019-07-23)


### Bug Fixes

* add missing semicolon ([e090934](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/e090934))
* add speaking error message when there are no configurations in the package.json ([22d008f](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/22d008f))
* don't remove webpack files while watch is running ([4da6084](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/4da6084))


### Features

* update dependencies to latest versions ([d45626f](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/d45626f))



# [3.4.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.4.0%0Dv3.3.4#diff) (2019-06-13)


### Features

* update dependencies to latest versions ([bbce61f](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/bbce61f))



## [3.3.4](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.3.4%0Dv3.3.3#diff) (2019-04-22)


### Bug Fixes

* **CustomSassLoader:** handle import errors in sass loader ([ec31f39](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/ec31f39))



## [3.3.3](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.3.3%0Dv3.3.2#diff) (2019-04-17)


### Bug Fixes

* more speaking errors when legacy adapter fails to copy build files ([65de0d8](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/65de0d8))



## [3.3.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.3.2%0Dv3.3.1#diff) (2019-04-11)


### Bug Fixes

* make sure the jsonp namespace of our webpack bundles is unique even if we build the package in the pipeline ([4604a48](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/4604a48))



## [3.3.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.3.1%0Dv3.3.0#diff) (2019-04-10)


### Bug Fixes

* fix issue with svg fonts that have a font selection using a hashtag (...myFont.svg#some-font) which broke the svg loader ([03dc707](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/03dc707))



# [3.3.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.3.0%0Dv3.2.12#diff) (2019-04-03)


### Bug Fixes

* fix issue on linux where the absolute url() paths, generated by custom-sass-loader could not be resolved by css-loader (because root urls are not resolved) ([ae2202f](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/ae2202f))


### Features

* allow plugin hooks to return a promise and handle it inside our synchronous context ([46dfaa7](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/46dfaa7))



## [3.2.12](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/branches/compare/v3.2.12%0Dv3.2.11#diff) (2019-03-27)


### Bug Fixes

* update dependencies ([fcd2f07](https://bitbucket.org/labor-digital/labor-dev-assetbuilding/commits/fcd2f07))



## [3.2.11] - 2019-02-26
### Fixed
- Fixed an issue with the legacy version of the less-loader which disabled the @import statement 
for the url-loader. This was copied from our old source files. I don't know why we put it there. I removed
it, because it does not make a lot of sense anymore `¯\_(ツ)_/¯`

## [3.2.10] - 2019-02-26
### Added
- Added acorn as dependency, to prevent a strange issue where it could not be resolved at arni's local setup.

## [3.2.9] - 2019-02-26
### Fixed
- IE 11 has Problems displaying SVG's from data urls which are bigger than 4k. After that initial 4kb all shapes will be filled black. Installed the [svg-url-loader](https://github.com/bhovhannes/svg-url-loader) in addition to our normal image loader to circumvent that problem.
- Implemented a fix from user https://github.com/Finesse to our svgFontHeightFix to allow multiple whitespaces and negative offset values when reading svg size from viewbox

## [3.2.8] - 2019-02-21
### Fixed
- Fixed the issue with the legacyAdapter -> for real this time.
- Fixed an issue with the copy config, which resulted in copying the assets in every app instead of only once

### Changed
- Changed the way how the CustomSassLoader resolves it's url imports, which should now be faster and more reliable.

## [3.2.7] - 2019-02-20
### Fixed
- Fixed the SvgFontHeightFix to work with illustrator's multi line svg tags as well

## [3.2.6] - 2019-02-19
### Added
- Added "iconfont-webpack-plugin" which automatically generates icon fonts out of svg files in css definitions using the font-icon: url("./myIcon.svg") notation.
- Added a bugfix to prevent errors in iconfont-webpack-plugin when the svg image does not supply a height attribute
- Added new copyright
- Added code styling phpstorm config

## [3.2.5] - 2019-02-18
### Fixed
- Fixed an issue with the legacyAdapter if there were assets in the output directory

## [3.2.4] - 2019-02-18
### Fixed
- Fixed issue with FileHelper.mkdir when creating folders starting at root level

## [3.2.3] - 2019-02-18
### Added
- Added new hook callbackBeforeGitAdd() to emit files which will be added to git automatically
- Added the option to add custom webpack config files for each app instead only globally

### Fixed
- Fixed an issue with the resource loader where resources could not be resolved if a file was higher than the entry point in the folder structure

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
