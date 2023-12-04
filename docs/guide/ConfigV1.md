# Config V1
Using a monolithic project structure for your assets is considered "legacy" since version 3.0.0 of this package. As it is still a requirement for a lot of projects, we keep support for this kind of asset-structure for the foreseeable future. 

To provide all features, we use an internal adapter-layer to render your assets using builder version 2, if possible. The adapter will also make sure that your assets will land at the specified output locations.

::: tip
Make sure you set the "builderVersion" option to 1!
:::

## js
This configuration has to be an array, as you may have multiple combinations of entry points and output files. The basic rule is that webpack loads your "entry" file and converts it into the "output" file, combining all included files into on.
The file paths have to be relative to your package.json.

By default, the script will assume you are writing es6 or Typescript and
transpile it down to es5, so it is compatible with IE10 and higher. 

If the "build" mode is used, the scripts will be minified.

Source maps of your files will automatically be created at OUTPUT_FILE.map.

Additionally, you can add a custom webpackConfig here as well. See the root webpackConfig for further details.

Furthermore, you now have the option to suppress warnings during the build via the warningsIgnorePattern, which is a RegExp. 
This is especially useful if you have certain warnings raising in a build, and you don't want the asset-building to exit with code 1.
```
"labor": {
  "builderVersion": 1,
  "js": [
    {
      "entry": "./webroot/js/application.js",
      "output": "webroot/js/bundle.js",
      "webpackConfig": {
        "target": "node"
      },
      "warningsIgnorePattern": "Pattern to check against the warnings to ignore them as RegEXP"
    }
  ]
}
```

## copy
There are a lot of use cases where you have to copy files from a destination to an output directory automatically. You can have multiple copy-jobs for a single project, so make sure that your "copy" node is an array of configuration objects.

This option is built on top of the "copy-webpack-plugin". Take a look at their [Documentation](https://github.com/webpack-contrib/copy-webpack-plugin) for how to use it in detail. In this example, we will only take a look at the defaults and the minor syntax changes we made.

**The change**: by default, you can only copy files from a single source into an output directory. I changed it so that "from" can also work with arrays of sources. Apart from that everything is straight forward. 

Say what (**from**) is copied, where (**to**), and you should be good to go. If you want to exclude some files, you can always use "**ignore**" for that. Keep in mind that both "from" and "ignore" support glob values. 
If you don't want to flatten everything into a directory set, "flatten: false".  
Typically files are copied after all other build steps. Via "first: true" you can set a copy-operation to be processed before the other build-steps.  
Sometimes you have copy-tasks, which should be executed if it's a build and not in a watch.
Set "inBuildOnly: true" in such a case.
```
"labor": {
    "builderVersion": 1,
    "copy": [
        {
            "from": [
                "assets/a/*",
                "./assets/b/**/b2.png",
                "./assets/**/asset.png"
            ],
            "to": "webroot/assets",
            "ignore": ["*.jpg", "assets/a/c"],
            "flatten": false,
            "first": false,
            "inBuildOnly": false
        }
    ]
}
```

## polyfills 
As stated in the section **Typescript, ES6, and Polyfills**, you
may also define polyfills that should be provided for your application. Those will be added to the default polyfills, which are always provided.
```
"labor": {
  "polyfills": ["core-js/fn/array/fill"]
}
```

## useTypeChecker
By default, we use ts-loader's "transpileOnly" option
to save a lot of time while compiling your scripts. If you want to use
the typescript-type checker, set this option to true. *Note from the author: Get a cup of coffee, this will take a while*
```
"labor": {
    "builderVersion": 1,
    "useTypeChecker": true
}
```

## jsCompat
Sometimes you have to fix an old JS library, which does not work nicely with webpack. 
In this case, the "imports-loader" comes to your rescue.
This configuration registers the module and make it a little bit easier to write.
For all configuration options take a look at [imports-loader](https://github.com/webpack-contrib/imports-loader).

As general rule => test and fix => loader in the other documentation.

* "rule" is a regex of a filename -> as a string in a JSON file. Without delimiters!
* "fix" is the definition for the imports-loader, e.g., a mapping of one value to another

```
"labor": {
  "builderVersion": 1,
  "jsCompat": [
    // A simple remapping of one value to another
    {
      "rule": "my-file\\.js$",
      "fix": "win=>window"
    },
    // Some JS libs need specially point e.g. "this" to "window".
    {
      "rule": "my-old-lib\\.js$",
      "fix": "this=>window"
    }
  ]
}
```

## css
The general idea is the same as with "js," but for, well, CSS files. 
You can also have multiple combinations of entry points and output files. So the "css" option has to be an Array containing your combinations as well. The file paths have to be relative to your package.json.

Valid file extensions are currently .css, .less, .scss and .sass. 
In general, you should keep your entry point in the same language as the rest of your styles, but you can mix and match between multiple languages. 
For advanced configuration of stylesheet building, take a look at 
"demo1/webroot/css/src/frontend/frontend.css". 

If the "build" mode is used, the scripts will be minified automatically.

Source maps of your files will automatically be created at OUTPUT_FILE.map.
```
"labor": {
  "builderVersion": 1,
  "css": [
    {
      "entry": "./webroot/css/src/backend/backend.sass",
      "output": "webroot/css/backend.css"
    },
    {
      "entry": "webroot/css/src/frontend/frontend.css",
      "output": "./webroot/css/frontend.css"
    }
  ]
}
```

## webpackConfig
There might be a time where our preconfigured webpack is not enough for your needs,
in that case, you can always alter the webpack configuration using this option.

Because the webpack config is mostly a js object we need to extend it using 
javascript as well. To do so, lets create a new file called webpack.config.js in your 
project root:
```javascript
const merge = require('webpack-merge');
module.exports = function(context){
   context.webpackConfig = merge(context.webpackConfig, {
      // Additional configuration for webpack...
   });
};
```

To tell the config builder to use your configuration file, add the script
with a path relative to your package.json to your app configuration. Or, if you
follow the convention by calling the file webpack.config.js, you can set the parameter to true.
```
"labor": {
  "builderVersion": 1,
  [...],
  "webpackConfig": TRUE
}
```

But in some cases, we only need to set or overwrite some webpack config settings. If so, we can write these additional settings as an object. 
```
"labor": {
  "builderVersion": 1,
  [...]
  "webpackConfig": {
    "target": "node",
    "output": {
      "libraryTarget": "umd"
    }
  }
}
```
