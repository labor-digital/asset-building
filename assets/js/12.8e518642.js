(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{364:function(e,t,s){"use strict";s.r(t);var a=s(42),r=Object(a.a)({},(function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("h1",{attrs:{id:"extensions"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#extensions"}},[e._v("#")]),e._v(" Extensions")]),e._v(" "),s("p",[e._v('If you want to dive deeper or wish to edit the webpack config manually, you can use either the "webpackConfig" option or create an extension that can utilize the provided hooks to alter the configuration.')]),e._v(" "),s("p",[e._v('Extensions are meant to create reusable packages to the asset builder that may require their own webpack plugins or loaders, while the "webpackConfig" option is intended a "per-project" alternative that requires no further understanding of the structure.')]),e._v(" "),s("p",[e._v('Extensions can be supplied either as "global" extension in the labor root or as a "per-app" extension if you are using builder version 2.')]),e._v(" "),s("h2",{attrs:{id:"registering-extensions"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#registering-extensions"}},[e._v("#")]),e._v(" Registering extensions")]),e._v(" "),s("p",[e._v("On a global scale:")]),e._v(" "),s("div",{staticClass:"language- extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[e._v('"labor": {\n    "extensions": [\n        "./extensions/MyDemoExtension.js",\n        "@labor-digital/your-packge/asset-building"\n    ]\n}\n')])])]),s("p",[e._v("On a per-app scale (only for builder version 2):")]),e._v(" "),s("div",{staticClass:"language- extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[e._v('"labor": {\n  "apps": [\n    {\n      "extensions": [\n          "./extensions/MyDemoExtension.js",\n          "@labor-digital/your-packge/asset-building"\n      ]\n    }\n  ]\n}\n')])])]),s("h2",{attrs:{id:"writing-extensions"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#writing-extensions"}},[e._v("#")]),e._v(" Writing extensions")]),e._v(" "),s("p",[e._v("Writing extensions is relatively simple. You can write them either in typescript or plain old javascript. You have to create a new file that exports a function by default. The function will receive two arguments.\nThe first argument is the context. The context holds all information about the current environment and built app-definition.\nIt also holds the event emitter that allows you to bind your handlers to the internal hooks of the asset builder.")]),e._v(" "),s("p",[e._v('As you see in the typescript definition, the context is either an object of type "WorkerContext" or "CoreContext".\nThe difference is that global extensions will receive the instance of the "CoreContext", while "per-app" extensions\nwill receive the "WorkerContext". The WorkerContext has more detailed information about the app as the CoreContext.')]),e._v(" "),s("p",[e._v('The "scope" defines if the extension is called either global, or as a per-app basis.')]),e._v(" "),s("p",[e._v("Per-App extensions will be executed once for every app they were registered in. Note, however, that the workers will all\nrun in separate processes that can't communicate with each other.")]),e._v(" "),s("h3",{attrs:{id:"as-js"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#as-js"}},[e._v("#")]),e._v(" As JS:")]),e._v(" "),s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[e._v("module"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[e._v("exports")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("function")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[e._v("context"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" scope")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// Do stuff")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n")])])]),s("h3",{attrs:{id:"as-typescript"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#as-typescript"}},[e._v("#")]),e._v(" As Typescript:")]),e._v(" "),s("div",{staticClass:"language-typescript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("import")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("WorkerContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("from")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"@labor-digital/asset-building/dist/Core/WorkerContext"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("import")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("CoreContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("from")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"@labor-digital/asset-building/dist/Core/CoreContext"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("export")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("default")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("function")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("context"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" WorkerContext"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("|")]),e._v("CoreContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" scope"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"app"')]),e._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("|")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"global"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n   "),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// Do stuff")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),s("h2",{attrs:{id:"using-hooks"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#using-hooks"}},[e._v("#")]),e._v(" Using hooks")]),e._v(" "),s("p",[e._v('The asset builder is littered with hooks you can use in your extension to filter the default configuration or to inject your own webpack configuration options.\nTo use the event emitter, you can simply access the context\'s event emitter property. It should show you the required auto-completion options.\nFor a definition of the possible event names, take a look at the "AssetBuilderEventList" enum object.')]),e._v(" "),s("p",[e._v('Each listener you register on a hook will receive an event object as a parameter. The event will\nalways contain a property called "args". The "e.args" property holds additional information\nabout the hook and the payload your listener should filter.')]),e._v(" "),s("div",{staticClass:"language-typescript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-typescript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("import")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("WorkerContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("from")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"@labor-digital/asset-building/dist/Core/WorkerContext"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("import")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("CoreContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("from")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"@labor-digital/asset-building/dist/Core/CoreContext"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("import")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("AssetBuilderEventList"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("from")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"@labor-digital/asset-building/dist/AssetBuilderEventList"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("export")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("default")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("function")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("context"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" WorkerContext"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("|")]),e._v("CoreContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" scope"),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v(":")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"app"')]),e._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("|")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[e._v('"global"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n   "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("context "),s("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("as")]),e._v(" CoreContext"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("eventEmiter")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("bind")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("AssetBuilderEventList"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),s("span",{pre:!0,attrs:{class:"token constant"}},[e._v("CALLBACK_DONE")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=>")]),e._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n       "),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// Show the arguments that were passed by the hook emitter")]),e._v("\n       "),s("span",{pre:!0,attrs:{class:"token builtin"}},[e._v("console")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("log")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),e._v("args"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),s("p",[e._v("Your bound listeners can either by sync or async. If you are running an async task in your listener, just return a promise object. The event emitter will wait until the returned promise\nis resolved before the next listener is called. So you can filter the given arguments\neven if you depend on asynchronous actions.")]),e._v(" "),s("h2",{attrs:{id:"a-note-on-the-builder-architecture"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#a-note-on-the-builder-architecture"}},[e._v("#")]),e._v(" A note on the builder architecture")]),e._v(" "),s("p",[e._v('The asset-builder is basically a list of default "configurator" objects. Each of those objects\nwill add its own configuration to the webpack configuration object. Each of the core configurators is represented by an "identifier". The list of identifiers can be found in the "AssetBuilderConfiguratorIdentifiers" enum.\nThe configurators are executed in the sequence that is defined in the "WebpackConfigGenerator" class.')]),e._v(" "),s("p",[e._v("Your extension can, if need be, disable specific configurators or completely replace them with an extended version by using the FILTER_CONFIGURATOR hook.")]),e._v(" "),s("h2",{attrs:{id:"hooks-for-global-extensions"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#hooks-for-global-extensions"}},[e._v("#")]),e._v(" Hooks for global extensions")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-shutdown"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-shutdown"}},[e._v("#")]),e._v(" AssetBuilderEventList.SHUTDOWN")]),e._v(" "),s("p",[e._v("Is called if either the main process, or a worker process detected a shutdown signal")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-labor-config"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-labor-config"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_LABOR_CONFIG")]),e._v(" "),s("p",[e._v("This hook can be used to filter the package.json -> labor configuration before\nthe config builder uses it to configure webpack.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-get-modes"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-get-modes"}},[e._v("#")]),e._v(" AssetBuilderEventList.GET_MODES")]),e._v(" "),s("p",[e._v('There can be multiple "tasks" or "modes" in the asset builder.\nA mode is the word that comes after "labor-asset-building $mode" in your script section. The mode defines, for example, if webpack should "watch" the source files and automatically recompile, or to "build" to output for production.\nYou can use this hook to add additional modes of other tasks you can think of.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-get-mode"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-get-mode"}},[e._v("#")]),e._v(" AssetBuilderEventList.GET_MODE")]),e._v(" "),s("p",[e._v('It can be used to set or filter the application mode that was given.\nIf "mode" is an empty string, there was no mode given.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-is-prod"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-is-prod"}},[e._v("#")]),e._v(" AssetBuilderEventList.IS_PROD")]),e._v(" "),s("p",[e._v('Webpack differentiates between "production" and "development".\nBy default "build" will set the mode to "isProd = true", while all other\nmodes will leave the sate at "isProd = false". Your plugin can determine if the mode is production or not in this method.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-after-main-init-done"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-after-main-init-done"}},[e._v("#")]),e._v(" AssetBuilderEventList.AFTER_MAIN_INIT_DONE")]),e._v(" "),s("p",[e._v("This hook is called after the main process finished its bootstrap\nand before it starts to spawn the worker processes.")]),e._v(" "),s("h2",{attrs:{id:"events-for-global-and-app-based-extensions"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#events-for-global-and-app-based-extensions"}},[e._v("#")]),e._v(" Events for global and app-based extensions")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-app-definition-schema"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-app-definition-schema"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_APP_DEFINITION_SCHEMA")]),e._v(" "),s("p",[e._v("The asset builder will apply a validation schema to each app definition object when the worker process starts.\nThis schema is used to set default values and to validate the input before we start the configuration.\nYour extension may use this hook to register additional properties to the schema. The schema is based on helferlein's makeOptions() function.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-after-worker-init-done"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-after-worker-init-done"}},[e._v("#")]),e._v(" AssetBuilderEventList.AFTER_WORKER_INIT_DONE")]),e._v(" "),s("p",[e._v("This hook is called after a worker process it's bootstrap and before it\nstarts to create the webpack configuration object.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-configurator"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-configurator"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_CONFIGURATOR")]),e._v(" "),s("p",[e._v("This hook is called for each built-in configurator. It can be used to either\ndisable a single configurator or to replace it with an extended version.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-before-configurator"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-before-configurator"}},[e._v("#")]),e._v(" AssetBuilderEventList.BEFORE_CONFIGURATOR")]),e._v(" "),s("p",[e._v("Is called right before a configurator will be executed")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-after-configurator"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-after-configurator"}},[e._v("#")]),e._v(" AssetBuilderEventList.AFTER_CONFIGURATOR")]),e._v(" "),s("p",[e._v("Is called right after a configurator was executed")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-loader-config"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-loader-config"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_LOADER_CONFIG")]),e._v(" "),s("p",[e._v('It can be used to filter the configuration for every loader we create in the webpack config.\nThe event will tell you which loader is currently configured using the "identifier" property.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-loader-test"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-loader-test"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_LOADER_TEST")]),e._v(" "),s("p",[e._v('Can be used to filter the regular expression that is used for a loader\'s test\nThe event will tell you which loader is currently configured using the "identifier" property.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-plugin-config"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-plugin-config"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_PLUGIN_CONFIG")]),e._v(" "),s("p",[e._v('Is called right before a new webpack plugin instance is injected into the webpack config.\nThe event will tell you which plugin is currently configured using the "identifier" property.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-polyfills"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-polyfills"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_POLYFILLS")]),e._v(" "),s("p",[e._v("This hook can be used to change which core-js polyfills shall be included in the package.\nIt is called "),s("strong",[e._v("after")]),e._v(" the configured polyfills have been merged into the default polyfills.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-get-js-provides"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-get-js-provides"}},[e._v("#")]),e._v(" AssetBuilderEventList.GET_JS_PROVIDES")]),e._v(" "),s("p",[e._v('To make js objects like the "$" in jQuery globally available without including\nit in every file, you can "provide" certain variables using the webpack\nProvidePlugin. But because there are issues when you create multiple providePlugin\ninstances, this hook should help you with that. Just add your provided var to the list of "provides" as you would like in your providePlugin, and you are good to go.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-js-pre-loaders"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-js-pre-loaders"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_JS_PRE_LOADERS")]),e._v(" "),s("p",[e._v("This hook can be used to add additional javascript preloaders into the stack")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-js-exclude-pattern"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-js-exclude-pattern"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_JS_EXCLUDE_PATTERN")]),e._v(" "),s("p",[e._v("Can be used to change the exclude pattern for some webpack loaders.\nThe "),s("strong",[e._v("pattern")]),e._v(" is either undefined or a regex like basePattern.\nThe "),s("strong",[e._v("identifier")]),e._v(' defines which loader requests the exclude pattern. Options are: "typescript", "tsJsPreLoaders",\nnamed after the components they are used in.\nThe '),s("strong",[e._v("basePattern")]),e._v(" is used by default and is a regex like: "),s("code",[e._v("/node_modules(?![\\\\/\\\\\\\\]@labor(?:-digital)?[\\\\/\\\\\\\\])/")]),e._v(",")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-typescript-options"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-typescript-options"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_TYPESCRIPT_OPTIONS")]),e._v(" "),s("p",[e._v("This hook can be used to change ts-loader options.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-postcss-plugins"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-postcss-plugins"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_POSTCSS_PLUGINS")]),e._v(" "),s("p",[e._v("Is used to filter and modify the list of postCss plugins (by default only autoprefixer and iconfont-webpack-plugin)")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-browser-list"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-browser-list"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_BROWSER_LIST")]),e._v(" "),s("p",[e._v("PostCss uses a "),s("a",{attrs:{href:"https://github.com/browserslist/browserslist#best-practices",target:"_blank",rel:"noopener noreferrer"}},[e._v("Browserlist"),s("OutboundLink")],1),e._v(' to determine which plugin it should use and how. By default our script uses "> 1%, last 10 versions". You can use this hook to change the default.')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-warning-to-ignore-patterns"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-warning-to-ignore-patterns"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_WARNING_TO_IGNORE_PATTERNS")]),e._v(" "),s("p",[e._v("Can be used to configure the list of regex's that will be used in WebpackFilterWarningsPlugin")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-html-plugin-template"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-html-plugin-template"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_HTML_PLUGIN_TEMPLATE")]),e._v(" "),s("p",[e._v('It can be used to filter the given template for the "HtmlWebpackPlugin". The given template is always an object, even if the laborConfig says only "true".')]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-apply-extension-webpack-config"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-apply-extension-webpack-config"}},[e._v("#")]),e._v(" AssetBuilderEventList.APPLY_EXTENSION_WEBPACK_CONFIG")]),e._v(" "),s("p",[e._v("This hook is called after the config generator finished applying all built-in configurator to the webpack config object.\nYou should use it to add your own webpack configuration to the object if you need to.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-webpack-config"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-webpack-config"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_WEBPACK_CONFIG")]),e._v(" "),s("p",[e._v("It is called right after the config builder finished generating the configuration and before it is merged with the custom webpack config provided by webpackConfig. This is your last chance to modify the webpack config before it is passed to webpack.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-filter-webpack-compiler"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-filter-webpack-compiler"}},[e._v("#")]),e._v(" AssetBuilderEventList.FILTER_WEBPACK_COMPILER")]),e._v(" "),s("p",[e._v("This hook allows you to either completely remove webpack as a compiler or supply a wrapper for it.\nAdditionally, you can change the callback that is called after webpack finished its process.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-compiling-done"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-compiling-done"}},[e._v("#")]),e._v(" AssetBuilderEventList.COMPILING_DONE")]),e._v(" "),s("p",[e._v("Only if the default callback is used!\nThis hook is called every time the webpack compiler is finished with its work.\nIt receives the result of webpack's "),s("a",{attrs:{href:"https://webpack.js.org/configuration/stats/",target:"_blank",rel:"noopener noreferrer"}},[e._v('"stats.toJson()"'),s("OutboundLink")],1),e._v(".")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-before-git-add"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-before-git-add"}},[e._v("#")]),e._v(" AssetBuilderEventList.BEFORE_GIT_ADD")]),e._v(" "),s("p",[e._v("It is called before the webpack callback handler automatically adds the dist files to the git repository.\nSo if you want to emit your own output, this is the place to do it.")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-callback-done"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-callback-done"}},[e._v("#")]),e._v(" AssetBuilderEventList.CALLBACK_DONE")]),e._v(" "),s("p",[e._v("The last possible callback for a single lifecycle")]),e._v(" "),s("h2",{attrs:{id:"events-for-built-in-loaders"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#events-for-built-in-loaders"}},[e._v("#")]),e._v(" Events for built-in loaders")]),e._v(" "),s("h4",{attrs:{id:"assetbuildereventlist-sass-loader-file-extension-fallback"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#assetbuildereventlist-sass-loader-file-extension-fallback"}},[e._v("#")]),e._v(" AssetBuilderEventList.SASS_LOADER_FILE_EXTENSION_FALLBACK")]),e._v(" "),s("p",[e._v("This hook is only executed if the custom sass loader is used. In some edge-cases, like Vue single-file components, the stylesheetPath does not end with .sass or .scss on which the sass loader relies to determine how to parse the file.")]),e._v(" "),s("p",[e._v("This hook can be used to find the source's real extension and to inject it back into the loader.")])])}),[],!1,null,null,null);t.default=r.exports}}]);