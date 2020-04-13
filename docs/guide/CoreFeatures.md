# Core Features
## Different config builder versions
The central part of this package is the so-called **Config Builder**, which takes your configuration out of the package.json and creates a webpack configuration out of it. The config is built in javascript and passed to webpack trough the [Node.js API](https://webpack.js.org/api/node/) so, don't look around for any config files, there will be none.

The generator currently supports two different "versions" which describe different architectures of your code. This document, especially the **Configuration** section, describes both versions and their differences. 

### Version 1 Monolithic
This is a carbon copy of your "old" / well-known style of 
monolithic application.(sass/scss/less) and application.js files. With version 1 we are able to transfer all our legacy projects to the modern world of asset building. That, however, includes a lot of manual labor like copying files to your public folder, using relative paths to CSS assets based on your public path, and so on. Take a look at the "demo1" directory.

### Version 2 App-Based
This version follows the "webpack/angular/vue..." approach, where everything you build is seen as a "component" of an app. If you want, you may create full-blown [Web Components](https://www.webcomponents.org) or, as I like to,
create components that still keep their sources like js, CSS or assets
in a single directory, bound by js includes. 

With this version, your assets in CSS files should be defined as paths relative to your source files or as node-modules, which will be resolved and gathered in an output directory; when building for production, webpack will also minify your images. When you look into the "demo2" directory, you see a basic example. **This is the default behavior**
 
## Commands / Modes
By default, there are two modes available (There may be more when you extend the config builder with plugins). You can run them from your CLI when you are in the SAME DIRECTORY as your package.json.

```
$ npm run build
```

This will build your sources in the production environment and stop itself.

```
$ npm run dev
```

This will build your sources in a dev environment and keep doing so while it watches the given entry points and their children for changes.

## Typescript, ES6 and Polyfills
Es6 and typescript offer a lot of nice features that will help you get more productive, while **not forcing you** to do anything different than before.

If you want to use es6 code, like arrow functions, constants and classes, go for it. All javascript will be piped through the typescript transpiler, which takes care of the conversion to the es5 compatible code. 

**Please note:** There are a lot of es6 features are supported by typescript but not by older browsers,
like promises, sets, maps, and symbols. If you want to use them, we have to provide so-called "polyfills" browsers that don't implement the required codebase. Those polyfills are provided by another
library which is called [Core-js](https://github.com/zloirock/core-js/tree/v2)
To keep your files small, we only include some basics.
Included polyfills are by default: 

* [core-js/fn/promise](https://github.com/zloirock/core-js#ecmascript-promise)
* [core-js/fn/set](https://github.com/zloirock/core-js#set)
* [core-js/fn/map](https://github.com/zloirock/core-js#map)
* [core-js/fn/object/assign](https://github.com/zloirock/core-js#ecmascript-object)
* [core-js/fn/object/entries](https://github.com/zloirock/core-js#ecmascript-object)
* [core-js/fn/object/keys](https://github.com/zloirock/core-js#ecmascript-object)
* [core-js/fn/array/from](https://github.com/zloirock/core-js#ecmascript-array)

If you want to add additional polyfills for your project, define them using the
"labor -> js -> polyfills" or "labor -> apps -> polyfills" options, depending
on your config builder version.

::: tip
**A note on typescript** When you want to use typescript, you can but be aware that
we DO NOT USE the typescript type checker (as it is far to slow for big codebases). If you want to
use the type checker anyway define that using the 
"labor -> js -> useTypeChecker" or "labor -> apps -> Your app -> useTypeChecker" options, 
depending on your builder version.
:::

## CSS Superscript resources
**Only interesting if you are using builder version 2.0**  

One problem one finds him/herself confronted with, when using components instead of monolithic CSS/sass/less is: All your styles will be compiled encapsulated from each other. Meaning you would have to register all your mixins/variables in every stylesheet you create. While not a real dealbreaker, it is (in my opinion) a hassle and not really intuitive.

To solve this, loaders like [sass-resources-loader](https://github.com/shakacode/sass-resources-loader) exist, but they all require configuration in the webpack file, which is (again, in my opinion) even less intuitive. So I wrote a simple implementation
of a resource loader which follows "Convention over configuration".

::: tip The convention
* Include (if present) a file called Resources.(sass/scss/less/css) in the same directory as your app's entry point.
* Follow the path from the entry point's directory down until you end at the current stylesheet.
* Include every Resources.(sass/scss/less/css) file you find on your way.
::: 

As an example:
```
|Components
| |Resources.sass
| |ComponentA
| | |Resources.scss
| | |ComponentA.js
| | |ComponentA.scss
| | |Assets
| | | |myImage.jpg
| |ComponentB
| | |Resources.less
| | |ComponentB.js
| | |ComponentB.less
| | |Assets
| | | |myImage.jpg
|Entrypont.js
|Resources.sass
|GlobalStyle
```

For "ComponentA" the loader will then automatically import the following files, at the top of componentA.scss:
* /Resources.sass
* /Components/Resources.sass
* /Components/ComponentA/Resources.scss (mind the extension)

For "ComponentB" the loader will only import the following because no other resource files are matching the file's extension (less):

* /Components/ComponentB/Resources.less

::: warning A word of caution
* Do not include anything that will be rendered in CSS, because it will be added to every file the resource loader touches.
* When importing other sass/less files from inside your Resources.sass you your path's should be relative to the current file
* If you are rendering source maps for your CSS files, this loader will mess up your line numbers!
* This is currently not tested with .less files - but it SHOULD work out of the box...
:::

## Icon Fonts from SVG
The script will now automatically create icon fonts which are specified like this:
```css
a:before {
  font-icon: url('./account.svg');
}
```
For more information check out the [iconfont-webpack-plugin](https://github.com/jantimon/iconfont-webpack-plugin)

## Analyze your chunks
When you are working with multiple chunks, you will, at some point in time, want to take a look at what's in those files. We use webpack-bundle-analyzer internally to provide you with that inside. To analyze your chunks, call `npm run analyze`, and the report will show up in your default browser, after the build finished.

