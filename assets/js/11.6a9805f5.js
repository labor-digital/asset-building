(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{363:function(e,s,t){"use strict";t.r(s);var o=t(42),r=Object(o.a)({},(function(){var e=this,s=e.$createElement,t=e._self._c||s;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"core-features"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#core-features"}},[e._v("#")]),e._v(" Core Features")]),e._v(" "),t("h2",{attrs:{id:"different-config-builder-versions"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#different-config-builder-versions"}},[e._v("#")]),e._v(" Different config builder versions")]),e._v(" "),t("p",[e._v("The central part of this package is the so-called "),t("strong",[e._v("Config Builder")]),e._v(", which takes your configuration out of the package.json and creates a webpack configuration out of it. The config is built in javascript and passed to webpack trough the "),t("a",{attrs:{href:"https://webpack.js.org/api/node/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Node.js API"),t("OutboundLink")],1),e._v(" so, don't look around for any config files, there will be none.")]),e._v(" "),t("p",[e._v('The generator currently supports two different "versions" which describe different architectures of your code. This document, especially the '),t("strong",[e._v("Configuration")]),e._v(" section, describes both versions and their differences.")]),e._v(" "),t("h3",{attrs:{id:"version-1-monolithic"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#version-1-monolithic"}},[e._v("#")]),e._v(" Version 1 Monolithic")]),e._v(" "),t("p",[e._v('This is a carbon copy of your "old" / well-known style of\nmonolithic application.(sass/scss/less) and application.js files. With version 1 we are able to transfer all our legacy projects to the modern world of asset building. That, however, includes a lot of manual labor like copying files to your public folder, using relative paths to CSS assets based on your public path, and so on. Take a look at the "demo1" directory.')]),e._v(" "),t("h3",{attrs:{id:"version-2-app-based"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#version-2-app-based"}},[e._v("#")]),e._v(" Version 2 App-Based")]),e._v(" "),t("p",[e._v('This version follows the "webpack/angular/vue..." approach, where everything you build is seen as a "component" of an app. If you want, you may create full-blown '),t("a",{attrs:{href:"https://www.webcomponents.org",target:"_blank",rel:"noopener noreferrer"}},[e._v("Web Components"),t("OutboundLink")],1),e._v(" or, as I like to,\ncreate components that still keep their sources like js, CSS or assets\nin a single directory, bound by js includes.")]),e._v(" "),t("p",[e._v('With this version, your assets in CSS files should be defined as paths relative to your source files or as node-modules, which will be resolved and gathered in an output directory; when building for production, webpack will also minify your images. When you look into the "demo2" directory, you see a basic example. '),t("strong",[e._v("This is the default behavior")])]),e._v(" "),t("h2",{attrs:{id:"commands-modes"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#commands-modes"}},[e._v("#")]),e._v(" Commands / Modes")]),e._v(" "),t("p",[e._v("By default, there are two modes available (There may be more when you extend the config builder with plugins). You can run them from your CLI when you are in the SAME DIRECTORY as your package.json.")]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("$ npm run build\n")])])]),t("p",[e._v("This will build your sources in the production environment and stop itself.")]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("$ npm run dev\n")])])]),t("p",[e._v("This will build your sources in a dev environment and keep doing so while it watches the given entry points and their children for changes.")]),e._v(" "),t("h2",{attrs:{id:"typescript-es6-and-polyfills"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#typescript-es6-and-polyfills"}},[e._v("#")]),e._v(" Typescript, ES6 and Polyfills")]),e._v(" "),t("p",[e._v("Es6 and typescript offer a lot of nice features that will help you get more productive, while "),t("strong",[e._v("not forcing you")]),e._v(" to do anything different than before.")]),e._v(" "),t("p",[e._v("If you want to use es6 code, like arrow functions, constants and classes, go for it. All javascript will be piped through the typescript transpiler, which takes care of the conversion to the es5 compatible code.")]),e._v(" "),t("p",[t("strong",[e._v("Please note:")]),e._v(' There are a lot of es6 features are supported by typescript but not by older browsers,\nlike promises, sets, maps, and symbols. If you want to use them, we have to provide so-called "polyfills" browsers that don\'t implement the required codebase. Those polyfills are provided by another\nlibrary which is called '),t("a",{attrs:{href:"https://github.com/zloirock/core-js/tree/v2",target:"_blank",rel:"noopener noreferrer"}},[e._v("Core-js"),t("OutboundLink")],1),e._v("\nTo keep your files small, we only include some basics.\nIncluded polyfills are by default:")]),e._v(" "),t("ul",[t("li",[t("a",{attrs:{href:"https://github.com/zloirock/core-js#ecmascript-promise",target:"_blank",rel:"noopener noreferrer"}},[e._v("core-js/fn/promise"),t("OutboundLink")],1)]),e._v(" "),t("li",[t("a",{attrs:{href:"https://github.com/zloirock/core-js#set",target:"_blank",rel:"noopener noreferrer"}},[e._v("core-js/fn/set"),t("OutboundLink")],1)]),e._v(" "),t("li",[t("a",{attrs:{href:"https://github.com/zloirock/core-js#map",target:"_blank",rel:"noopener noreferrer"}},[e._v("core-js/fn/map"),t("OutboundLink")],1)]),e._v(" "),t("li",[t("a",{attrs:{href:"https://github.com/zloirock/core-js#ecmascript-object",target:"_blank",rel:"noopener noreferrer"}},[e._v("core-js/fn/object/assign"),t("OutboundLink")],1)]),e._v(" "),t("li",[t("a",{attrs:{href:"https://github.com/zloirock/core-js#ecmascript-object",target:"_blank",rel:"noopener noreferrer"}},[e._v("core-js/fn/object/entries"),t("OutboundLink")],1)]),e._v(" "),t("li",[t("a",{attrs:{href:"https://github.com/zloirock/core-js#ecmascript-object",target:"_blank",rel:"noopener noreferrer"}},[e._v("core-js/fn/object/keys"),t("OutboundLink")],1)]),e._v(" "),t("li",[t("a",{attrs:{href:"https://github.com/zloirock/core-js#ecmascript-array",target:"_blank",rel:"noopener noreferrer"}},[e._v("core-js/fn/array/from"),t("OutboundLink")],1)])]),e._v(" "),t("p",[e._v('If you want to add additional polyfills for your project, define them using the\n"labor -> js -> polyfills" or "labor -> apps -> polyfills" options, depending\non your config builder version.')]),e._v(" "),t("div",{staticClass:"custom-block tip"},[t("p",{staticClass:"custom-block-title"},[e._v("TIP")]),e._v(" "),t("p",[t("strong",[e._v("A note on typescript")]),e._v(' When you want to use typescript, you can but be aware that\nwe DO NOT USE the typescript type checker (as it is far to slow for big codebases). If you want to\nuse the type checker anyway define that using the\n"labor -> js -> useTypeChecker" or "labor -> apps -> Your app -> useTypeChecker" options,\ndepending on your builder version.')])]),e._v(" "),t("h2",{attrs:{id:"css-superscript-resources"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#css-superscript-resources"}},[e._v("#")]),e._v(" CSS Superscript resources")]),e._v(" "),t("p",[t("strong",[e._v("Only interesting if you are using builder version 2.0")])]),e._v(" "),t("p",[e._v("One problem one finds him/herself confronted with, when using components instead of monolithic CSS/sass/less is: All your styles will be compiled encapsulated from each other. Meaning you would have to register all your mixins/variables in every stylesheet you create. While not a real dealbreaker, it is (in my opinion) a hassle and not really intuitive.")]),e._v(" "),t("p",[e._v("To solve this, loaders like "),t("a",{attrs:{href:"https://github.com/shakacode/sass-resources-loader",target:"_blank",rel:"noopener noreferrer"}},[e._v("sass-resources-loader"),t("OutboundLink")],1),e._v(' exist, but they all require configuration in the webpack file, which is (again, in my opinion) even less intuitive. So I wrote a simple implementation\nof a resource loader which follows "Convention over configuration".')]),e._v(" "),t("div",{staticClass:"custom-block tip"},[t("p",{staticClass:"custom-block-title"},[e._v("The convention")]),e._v(" "),t("ul",[t("li",[e._v("Include (if present) a file called Resources.(sass/scss/less/css) in the same directory as your app's entry point.")]),e._v(" "),t("li",[e._v("Follow the path from the entry point's directory down until you end at the current stylesheet.")]),e._v(" "),t("li",[e._v("Include every Resources.(sass/scss/less/css) file you find on your way.")])])]),e._v(" "),t("p",[e._v("As an example:")]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("|Components\n| |Resources.sass\n| |ComponentA\n| | |Resources.scss\n| | |ComponentA.js\n| | |ComponentA.scss\n| | |Assets\n| | | |myImage.jpg\n| |ComponentB\n| | |Resources.less\n| | |ComponentB.js\n| | |ComponentB.less\n| | |Assets\n| | | |myImage.jpg\n|Entrypont.js\n|Resources.sass\n|GlobalStyle\n")])])]),t("p",[e._v('For "ComponentA" the loader will then automatically import the following files, at the top of componentA.scss:')]),e._v(" "),t("ul",[t("li",[e._v("/Resources.sass")]),e._v(" "),t("li",[e._v("/Components/Resources.sass")]),e._v(" "),t("li",[e._v("/Components/ComponentA/Resources.scss (mind the extension)")])]),e._v(" "),t("p",[e._v('For "ComponentB" the loader will only import the following because no other resource files are matching the file\'s extension (less):')]),e._v(" "),t("ul",[t("li",[e._v("/Components/ComponentB/Resources.less")])]),e._v(" "),t("div",{staticClass:"custom-block warning"},[t("p",{staticClass:"custom-block-title"},[e._v("A word of caution")]),e._v(" "),t("ul",[t("li",[e._v("Do not include anything that will be rendered in CSS, because it will be added to every file the resource loader touches.")]),e._v(" "),t("li",[e._v("When importing other sass/less files from inside your Resources.sass you your path's should be relative to the current file")]),e._v(" "),t("li",[e._v("If you are rendering source maps for your CSS files, this loader will mess up your line numbers!")]),e._v(" "),t("li",[e._v("This is currently not tested with .less files - but it SHOULD work out of the box...")])])]),e._v(" "),t("h2",{attrs:{id:"icon-fonts-from-svg"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#icon-fonts-from-svg"}},[e._v("#")]),e._v(" Icon Fonts from SVG")]),e._v(" "),t("p",[e._v("The script will now automatically create icon fonts which are specified like this:")]),e._v(" "),t("div",{staticClass:"language-css extra-class"},[t("pre",{pre:!0,attrs:{class:"language-css"}},[t("code",[t("span",{pre:!0,attrs:{class:"token selector"}},[e._v("a:before")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[e._v("font-icon")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token url"}},[t("span",{pre:!0,attrs:{class:"token function"}},[e._v("url")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token string url"}},[e._v("'./account.svg'")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")])]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),t("p",[e._v("For more information check out the "),t("a",{attrs:{href:"https://github.com/jantimon/iconfont-webpack-plugin",target:"_blank",rel:"noopener noreferrer"}},[e._v("iconfont-webpack-plugin"),t("OutboundLink")],1)]),e._v(" "),t("h2",{attrs:{id:"analyze-your-chunks"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#analyze-your-chunks"}},[e._v("#")]),e._v(" Analyze your chunks")]),e._v(" "),t("p",[e._v("When you are working with multiple chunks, you will, at some point in time, want to take a look at what's in those files. We use webpack-bundle-analyzer internally to provide you with that inside. To analyze your chunks, call "),t("code",[e._v("npm run analyze")]),e._v(", and the report will show up in your default browser, after the build finished.")])])}),[],!1,null,null,null);s.default=r.exports}}]);