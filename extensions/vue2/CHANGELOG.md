# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.1.1](https://github.com/labor-digital/asset-building-env-vuejs/compare/v4.1.0...v4.1.1) (2021-03-15)

## [4.1.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v4.0.2...v4.1.0) (2021-01-22)


### Features

* **SsrResponseHandler:** implement "afterRendering" hook ([49d571a](https://github.com/labor-digital/asset-building-env-vuejs/commit/49d571a48a0cd9eebd880bf44d31c6abb8229e08))
* update dependencies ([a6b64c8](https://github.com/labor-digital/asset-building-env-vuejs/commit/a6b64c87f52578a018c4237857a4423bc9374b50))

### [4.0.2](https://github.com/labor-digital/asset-building-env-vuejs/compare/v4.0.1...v4.0.2) (2020-10-29)


### Bug Fixes

* **SsrPluginHandler:** make sure the routes are registered after the config is ready ([539e768](https://github.com/labor-digital/asset-building-env-vuejs/commit/539e768e789f4faa4ca3dccbcd6118df3c2af175))

### [4.0.1](https://github.com/labor-digital/asset-building-env-vuejs/compare/v4.0.0...v4.0.1) (2020-10-29)


### Bug Fixes

* **SsrPluginHandler:** serve asset route before content catch-all route ([8f9d4f5](https://github.com/labor-digital/asset-building-env-vuejs/commit/8f9d4f5ca100dd36bd78697b049129021dde3dcf))

## [4.0.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v3.1.2...v4.0.0) (2020-10-23)


### ⚠ BREAKING CHANGES

* major dependency updates
* API adjustments

### Features

* update dependencies ([1f6aa43](https://github.com/labor-digital/asset-building-env-vuejs/commit/1f6aa4376de93f8822a1e308014dc20064416b72))
* update to asset-builder version 8.0.0 ([bd4fe71](https://github.com/labor-digital/asset-building-env-vuejs/commit/bd4fe71dd526cb99d4352ff9399fe006fb6ef54e))

### [3.1.2](https://github.com/labor-digital/asset-building-env-vuejs/compare/v3.1.1...v3.1.2) (2020-08-27)


### Bug Fixes

* make sure the post css-loader does not crash the builder ([9542abb](https://github.com/labor-digital/asset-building-env-vuejs/commit/9542abbad0e87e9cf695c565f10336de95361d19))

### [3.1.1](https://github.com/labor-digital/asset-building-env-vuejs/compare/v3.1.0...v3.1.1) (2020-08-27)


### Bug Fixes

* resolve issues where vue-style-loader could not build styles with css-loader v4.0 ([47a4b86](https://github.com/labor-digital/asset-building-env-vuejs/commit/47a4b862882e939197ec0b2a33aed920ac65e0a2))

## [3.1.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v3.0.0...v3.1.0) (2020-08-26)


### Features

* update dependencies ([2aeeeeb](https://github.com/labor-digital/asset-building-env-vuejs/commit/2aeeeeb907cccc30cf4f954a0eb8b02e48794af1))

## [3.0.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.14.0...v3.0.0) (2020-07-20)


### ⚠ BREAKING CHANGES

* renames some parameters from whitelist to allowList

### Features

* update dependencies and update code to match ([bcb68c8](https://github.com/labor-digital/asset-building-env-vuejs/commit/bcb68c8724cf551b9b1c2c43608e15a322698cb4))

## [2.14.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.13.0...v2.14.0) (2020-06-17)


### Features

* update dependencies ([6332a5c](https://github.com/labor-digital/asset-building-env-vuejs/commit/6332a5c507207d908d0e5f3f756248e0a135e0f9))

## [2.13.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.12.0...v2.13.0) (2020-04-24)


### Features

* implement externalWhitelist option for SSR apps ([b544a03](https://github.com/labor-digital/asset-building-env-vuejs/commit/b544a0343014d15e7f6e65068053680ab2b809fc))
* pretty up package.json + update dependencies ([93b1bda](https://github.com/labor-digital/asset-building-env-vuejs/commit/93b1bdaec9648f0f144acd35734228c2b5315367))


### Bug Fixes

* add Arrays.include polyfill to make sure your vue-i18n installation won't break in the latest update ([483ede2](https://github.com/labor-digital/asset-building-env-vuejs/commit/483ede24833b4310658d7e5cddecb8826555368b))

## [2.12.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.11.0...v2.12.0) (2020-04-13)


### Features

* update dependencies + fix typos in the readme.md file ([3da8165](https://github.com/labor-digital/asset-building-env-vuejs/commit/3da816591ab92e0e233e6d3344790810a5a4757e))

## [2.11.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.10.1...v2.11.0) (2020-04-11)


### Features

* update dependencies ([734c762](https://github.com/labor-digital/asset-building-env-vuejs/commit/734c762f4c4fd1c13a6c694dab42bb846839b51d))

### [2.10.1](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.10.0...v2.10.1) (2020-03-23)

## [2.10.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.9.2...v2.10.0) (2020-02-18)


### Features

* add options and environment variables to the express ssr plugin implementation ([d07f7b5](https://github.com/labor-digital/asset-building-env-vuejs/commit/d07f7b54aa318731ab8ca9e885bc874baced025a))

### [2.9.2](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.9.1...v2.9.2) (2020-02-18)


### Bug Fixes

* keep indexTemplate in the output package for the ssr renderer ([45b7042](https://github.com/labor-digital/asset-building-env-vuejs/commit/45b7042ee24c6811d337a801723961c1a9953490))

### [2.9.1](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.9.0...v2.9.1) (2020-02-17)


### Bug Fixes

* remove package locks from demo directories ([6c30526](https://github.com/labor-digital/asset-building-env-vuejs/commit/6c3052681ed5332b25a692e5560958d912ed78da))

## [2.9.0](https://github.com/labor-digital/asset-building-env-vuejs/compare/v2.8.2...v2.9.0) (2020-02-17)


### Features

* prepare release on github ([3e54e23](https://github.com/labor-digital/asset-building-env-vuejs/commit/3e54e23c1c1f53a340dc183129667cc0964ca4ee))


### Bug Fixes

* fix the breaking issue with the public asset registration ([431004d](https://github.com/labor-digital/asset-building-env-vuejs/commit/431004dd9ffb991f2eabe174358b2afd482a10f9))
* update import statements for new package namespace ([69f4ce3](https://github.com/labor-digital/asset-building-env-vuejs/commit/69f4ce329195eab2aedc1bae78505afe85129627))

## [2.8.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.8.2%0Dv2.8.1#diff) (2020-01-15)


### Bug Fixes

* make sure the public asset directory is correctly registered ([fa4a7d9](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/fa4a7d9))



## [2.8.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.8.1%0Dv2.8.0#diff) (2020-01-15)


### Bug Fixes

* make sure we don't loose vue-ssr-server-bundle.json because of the clean output dir plugin ([72e8ef8](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/72e8ef8))



# [2.8.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.8.0%0Dv2.7.1#diff) (2020-01-10)


### Features

* **ExpressSsrPlugin:** let the app handle both status and header management, by passing the express request and response objects to the vue render context ([ebf7abe](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/ebf7abe))



## [2.7.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.7.1%0Dv2.7.0#diff) (2020-01-09)


### Bug Fixes

* fix ordering warnings when using vue components in combination with the css-extract-plugin ([28ff56d](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/28ff56d))



# [2.7.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.7.0%0Dv2.6.0#diff) (2019-12-29)


### Features

* update dependencies + use registerPublicAssets method to register static assets ([5f2fd90](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/5f2fd90))



# [2.6.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.6.0%0Dv2.5.0#diff) (2019-12-04)


### Features

* add additional loader to remove "/deep/" from css rules after the vue-loader processed the rules for nested components ([3fbfb30](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/3fbfb30))



# [2.5.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.5.0%0Dv2.4.3#diff) (2019-12-04)


### Bug Fixes

* fix issue where the css code was not minified in production ([942365a](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/942365a))


### Features

* make sure the client output file contains a hash sum so we avoid caching issues ([4c392ee](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/4c392ee))



## [2.4.3](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.4.3%0Dv2.4.2#diff) (2019-11-29)


### Bug Fixes

* remove debug code ([daee9bc](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/daee9bc))



## [2.4.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.4.2%0Dv2.4.1#diff) (2019-11-29)


### Bug Fixes

* make sure the css files get minified when we are building an ssr app for production ([ee51af3](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/ee51af3))



## [2.4.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.4.1%0Dv2.4.0#diff) (2019-11-27)


### Bug Fixes

* make sure the ssr renderer can inject the styles into the page html even when running in production mode ([f5d59e0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/f5d59e0))



# [2.4.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.4.0%0Dv2.3.4#diff) (2019-11-08)


### Features

* **ExpressSsrPlugin:** render inline styles only in production, to avoid issues with combating definitions when using dev hot reloading ([af08017](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/af08017))



## [2.3.4](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.3.4%0Dv2.3.3#diff) (2019-11-05)


### Bug Fixes

* **ExpressSsrPlugin:** fix issues when injecting the metadata into the template ([322d195](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/322d195))



## [2.3.3](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.3.3%0Dv2.3.2#diff) (2019-10-28)


### Bug Fixes

* fix for node env generation ([4e25277](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/4e25277))
* fix template rendering on ssr to avoid duplicate code execution ([04e37a4](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/04e37a4))



## [2.3.2](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.3.2%0Dv2.3.1#diff) (2019-10-28)


### Bug Fixes

* fix for broken public path ([81f5782](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/81f5782))



## [2.3.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.3.1%0Dv2.3.0#diff) (2019-10-27)


### Bug Fixes

* fix for broken output path ([9e6b3a1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/9e6b3a1))



# [2.3.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.3.0%0Dv2.2.0#diff) (2019-10-23)


### Features

* add vue-meta support for the ssr renderer ([fad58f7](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/fad58f7))



# [2.2.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.2.0%0Dv2.1.0#diff) (2019-10-22)


### Features

* automatically enable htmlTemplate if SSR mode is active ([0590fd4](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/0590fd4))
* implement status code bridge to the vue rendering package ([6465ac0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/6465ac0))



# [2.1.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.1.0%0Dv2.0.0#diff) (2019-10-15)


### Features

* finalize SSR implementation using the latest asset-builder version ([a74b305](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/a74b305))



# [2.0.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v2.0.0%0Dv1.3.0#diff) (2019-10-11)


### Bug Fixes

* update dependencies ([0ebb85f](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/0ebb85f))


### Features

* update for latest asset builder version ([b73b03e](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/b73b03e))


### BREAKING CHANGES

* This package is no longer compatible with asset builder
v3



# [1.3.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v1.3.0%0Dv1.2.0#diff) (2019-09-25)


### Features

* update dependencies ([a30979b](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/a30979b))



# [1.2.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v1.2.0%0Dv1.1.1#diff) (2019-08-01)


### Features

* add useCssExtractPlugin toggle + add support for jsx/tsx templates ([c5ee2d6](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/c5ee2d6))
* update dependencies ([e1023ad](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/e1023ad))



## [1.1.1](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v1.1.1%0Dv1.1.0#diff) (2019-07-01)


### Bug Fixes

* try to fix wrong vue versions in projects ([09f50e5](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/09f50e5))



# [1.1.0](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/branches/compare/v1.1.0%0Dv1.0.8#diff) (2019-06-13)


### Features

* update dependencies and add pipeline support ([8935ed4](https://bitbucket.org/labor-digital/labor-dev-assetbuilding-env-vuejs/commits/8935ed4))



## [1.0.8] - 2019-02-06
### Changed
- Converted all dependency versions to absolute numbers

## [1.0.7] - 2019-02-06
### Removed
- Removed no longer needed dependencies

## [1.0.6] - 2019-02-06
### Removed
- Removed some no longer required Hooks for customSassLoader and esLint

## [1.0.5] - 2019-01-30
### Changed
- Updated dependencies to their latest versions

## [1.0.4] - 2019-01-14
### Changed
- Added vue as dependency so we can be sure we always have the same version of vue and the template compiler
- Updated dependencies

## [1.0.3] - 2019-01-11
### Fixed
- Fixed an issue where the eslint parserOptions were overwritten by our config

## [1.0.2] - 2019-01-10
### Fixed
- Fixed an issue with the eslint implementation for vue files

## [1.0.1] - 2018-12-20
### Added
- Added a workaround to make sure sass resources get loaded like in the default behaviour
- Added sass loader file extension helper 

### Changed
- Switched style loaders back to the default variants, thanks to better plugin integration

## [1.0.0] - 2018-12-18
Initial commit

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).
