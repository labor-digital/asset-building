# Asset - Building
This package provides you with the whole suitcase of modern asset building for the web. Build on top of webpack it goes a similar root as [encore](https://github.com/symfony/webpack-encore) or [mix](https://laravel.com/docs/7.x/mix) but with almost zero configuration on your part. 
We use this builder for all of our projects from traditional monolithic javascript, over jQuery, Vue.js, and Typescript (It can't cook you a coffee, tho!).
If the base distribution does not meet your requirements, it is possible to extend it using the built-in hook system or by writing your webpack config.

As a general rule of thumb: All configuration is done within your package.json 
file in a node called: "labor". The default configuration is rather simple and
should be more or less agnostic to webpack. If you want more configuration options
when it comes to webpack, you can extend this library using its lightweight 
"Plugin-API" (You can learn more about plugins in the section **labor -> plugins**). 

**Included webpack modules and plugins:**  

* Copy files with ([copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin))
* Build css from sass, scss and less sources ([css-loader](https://github.com/webpack-contrib/css-loader), [sass-loader](https://github.com/webpack-contrib/sass-loader), [less-loader](https://github.com/webpack-contrib/less-loader))
* Extract css files ([mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin))
* Minify css files when using "build" ([optimize-css-assets-webpack-plugin](https://github.com/NMFR/optimize-css-assets-webpack-plugin))
* Transpiling Es6 Js and typescript sources to es5 ([ts-loader](https://github.com/TypeStrong/ts-loader))
* Minify js files when using "build" ([uglifyjs-webpack-plugin](https://webpack.js.org/plugins/uglifyjs-webpack-plugin))
* Automatically add css-prefixes for older browsers: ([Autoprefixer](https://github.com/postcss/autoprefixer))
* Creation of source-maps for js files
* Chunk/Bundle analyzing when using "analyze" ([webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

**Included webpack modules and plugins * Builder Version 2.0**  

- Import html in javascript ([html-loader](https://webpack.js.org/loaders/html-loader/))
- Image minification when using "build" ([image-webpack-loader](https://github.com/tcoopman/image-webpack-loader))
- Font handling ([file-loader](https://github.com/webpack-contrib/file-loader))
- Output directory cleaning ([CleanWebpackPlugin](https://github.com/johnagan/clean-webpack-plugin))
- Progressbar while building ([progress-bar-webpack-plugin](https://github.com/clessg/progress-bar-webpack-plugin))
- A HTML templating plugin ([Html Webpack Plugin](https://github.com/jantimon/html-webpack-plugin))
- Automatic iconfont generation from svg images ([iconfont-webpack-plugin](https://github.com/jantimon/iconfont-webpack-plugin))
- I implemented a custom sass loader to speed up module based sass compiling
- You can work with dynamic imports everywhere, thanks to an automatic promise polyfill for webpack

**Available extensions to provide additional functionality**

- [Dev server as standalone and express middleware](https://www.npmjs.com/package/@labor-digital/asset-building-dev-server)
- [Vue.js build environment](https://www.npmjs.com/package/@labor-digital/asset-building-env-vuejs)

** Available bridges to use the asset builder in other environments**

- Express
- Storybook
- Nuxt

## Installation
* Install the npm dependency:
```
npm install --save-dev @labor-digital/asset-building
```
*This package works in Node.js ^14.21.0.*

* Add the following part to your package.json:
```
  "scripts": {
    "build": "labor-asset-building build",
    "watch": "labor-asset-building watch",
    "analyze": "labor-asset-building analyze"
  }
```
* Done! :-)

## Basic usage
For a basic usage example either take a look at the "demo" directories or create a new 
"App.ts" file next to your package.json, add "console.log("Hello world");" as content and alter
your package.json like so:
```
"labor": {
    "apps": [
        {
            "entry": "./App.ts",
            "output": "./dist/bundle.js",
        }
    ]
}
```

Start the watcher with "npm run watch" and the script should do it's magic :)

## Source Code
The source code can be found on [github](https://github.com/labor-digital/asset-building).

## Building the sources

- Clone the repository
- Navigate to the root directory (where the "package.json" lives)
- Install the dependencies with ```npm install```
- Run the continuous watcher for development ```npm run watch```
- OR build the sources for production ```npm run build```

## Building the documentation
The documentation is powered by [vuepress](https://vuepress.vuejs.org/), you can spin up a dev server like so:

- Clone the repository
- Navigate to ```docs```
- Install the dependencies with ```npm install```
- Run the dev server with ```npm run dev```

## Postcardware
You're free to use this package, but if it makes it to your production environment, we highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany.

We publish all received postcards on our [company website](https://labor.digital). 