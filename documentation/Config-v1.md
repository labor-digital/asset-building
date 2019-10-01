# Configuration v1
This document contains all configuration options that apply to the first version of the configuration manifest. Since the Asset-Builder version 3 there is a Legacy Adapter working to compile your assets like you would with version 2 of the builder but without the need to change your configuration. 

## js
This configuration has to be an array, as you may have multiple combinations of 
entry points and output files. The basic rule is, that webpack loads your "entry" 
file and converts it into the "output" file, combining all included files into on.
The filepaths have to be relative to your package.json.

By default the script will assume you are writing es6 or Typescript and
transpile it down to es5, so it is compatible to IE10 and higher. 

If the "build" mode is used the scripts will be minified.

Sourcemaps of your files will automatically created at OUTPUT_FILE.map.

Additionally you can add a custom webpackConfig here as well. See the root webpackConfig for further details.

Furthermore you now have the option to suppress warnings during the build via the warningIgnorePattern, which is a RegExp. 
This is especially useful if you have certain warnings raising in a build and you don´t want the asset-building to exit with code 1.
```
"labor": {
  "js": [
    {
      "entry": "./webroot/js/application.js",
      "output": "webroot/js/bundle.js",
      "webpackConfig": {
        "target": "node"
      },
      "warningIgnorePattern": "Pattern to check against the warnings to ignore them as RegEXP"
    }
  ]
}
```

### copy
There are a lot of usecases where you have to automatically copy files from a 
destination to a output directory. You can have multiple copy-jobs for a 
single project, so make sure that your "copy" node is an array of 
configuration objects.

This option is build on top of the "copy-webpack-plugin". Take a look at their 
[Documentation](https://github.com/webpack-contrib/copy-webpack-plugin) for how to 
use it in detail. In this example we will only take a look at the defaults and the 
minor syntaxchange we made.

**The change**: by default you can only copy files from a single source into an 
output directory. I changed it so that "from" can also work with arrays of sources.
Apart from that everything is straight forward. 

Say what (from) is copied, where (to) and you should be good to go. 
If you want to exclude some files you can always use "ignore" for that. 
Keep in mind that both, "from" and "ignore" support glob values. 
If you don't want to flatten everything into a directory set "flatten: false" 
and you are set.  
Normally files are copied after all other build steps. Via "first: true" you can set
a copy-operation to be processed before the other build-steps.  
Sometimes you have copy-tasks, which should be executed if it´s a build and not in a watch.
Set "inBuildOnly: true" in such a case.
```
"labor": {
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
As stated in the section **Typescript, ES6 and Polyfills** you
may also define polyfills that should be provided for your application. Those
will be added to the default polyfills which are always provided.
```
"labor": {
  "polyfills": ["core-js/fn/array/fill"]
}
```

##useTypeChecker
By default we use ts-loader's "transpileOnly" option
to save a lot of time while compiling your scripts. If you want to use
the typescript-typechecker set this option to true. *Note from the author: 
Get a cup of coffee, this will take a while*
```
"labor": {
  "useTypeChecker": true
}
```

## jsCompat
Sometimes you have to fix an old JS library which does not work nice with webpack. 
In this case the "imports-loader" comes to your rescue.
This configuration registers the module and make it a little bit easier to write.
For all configuration options take a look at [imports-loader](https://github.com/webpack-contrib/imports-loader).

As general rule => test and fix => loader in the other documentation.

* "rule" is a regex of a filename -> as a string in a json file. Without delimiters!
* "fix" is the definition for the imports-loader, eg a mapping of one value to 
another

```
"labor": {
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
The general idea is exactly the same as with "js", but for, well, css files. 
You can also have multiple combinations of entry points and output files. So 
the "css" option has to be an Array containing your combinations as well. 
The filepaths have to be relative to your package.json.

Valid file extensions are currently .css, .less, .scss and .sass. 
In general you should keep your entrypoint in the same language as the rest 
of your styles, but you can mix and match between multiple languages. 
For advanced configuration of stylesheet building, take a look at 
"demo1/webroot/css/src/frontend/frontend.css". 

If the "build" mode is used the scripts will be minified automatically.

Sourcemaps of your files will automatically created at OUTPUT_FILE.map.
```
"labor": {
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

## environment
The concept of environments was introduced in package version 3 and can be seen as additional configuration based on the framework you work with.
For example if you use vue.js you need the vue-loader to use single-file-components. To preconfigure the overhead there is an environment for that
which does the additional configuration for you.
Currently only "vuejs" is supported, but you can add environments using plugins.
```
"labor": {
  "environment": "vuejs"
}
```