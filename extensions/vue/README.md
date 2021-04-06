# LABOR - Asset Building - Vue.js Extension
**This package is an extension to our [asset building bundle](https://www.npmjs.com/package/@labor-digital/asset-building).**

It provides you with everything you need to use vue.js in a webpack pipeline.
The library utilizes vue-loader to support single-file components, prepares the Vue framework, and sets up the required style loaders.

You should also consider installing the [asset-building-dev-server](https://www.npmjs.com/package/@labor-digital/asset-building-dev-server) extension to get the most out of your local development experience

## Installation

* Install our asset builder:
``` 
npm install --save-dev @labor-digital/asset-building
```
* Install the npm dependency:
```
npm install --save-dev @labor-digital/asset-building-env-vuejs
```
* Add the extension to your package.json
```
{ 
    "apps": [
        {
            ...
            "extensions": [
                "@labor-digital/asset-building-env-vuejs"
            ]
        }
    ]
}
```
* Done! :-)

## Usage

There are three modes in which you can develop your application.

### 1. Default Mode

By default and without any other configuration, the extension will set up the webpack process with all required plugins so that you can compile and watch your vue.js components in a breeze. After installing the extension run "npm run build" and you should be done.

### 2. Dev-Server Mode

When you are using the "dev" command, provided by the [asset-building-dev-server](https://www.npmjs.com/package/@labor-digital/asset-building-dev-server) extension,
you get all the benefits of hot module replacement and in-memory compiling out of the box.

### 3. SSR (Server-Side-Rendering) Mode

Vue.js comes with a powerful [server-side rendering implementation](https://ssr.vuejs.org/). To use it to it's fullest, we added built-in support for the express middleware stack. For the best results, you should also use the [asset-building-dev-server](https://www.npmjs.com/package/@labor-digital/asset-building-dev-server) extension to get all benefits of Vue's SSR capabilities in production and webpack's awesome benefits as well.
To enable SSR in your app, you have to add ``` "useSsr": true ``` to the app configuration in your package.json. In addition, you have to add the ExpressSsrPlugin to your index.js, as described in the demo-ssr directory.

## Deep for nested components

When you are using scoped styles in combination with "sass" you probably know that you can style child components by using the "/deep/" selector modifier.
However, the node style parser no longer removes the "/deep/" from the outputted CSS source, which can cause issues in firefox or the internet explorer.
For that reason, this package comes with a special webpack loader that removes all "/deep/" selectors from the generated CSS files.

## Environment Variables for SSR

We wanted to describe Apps on an environment base that should be dynamic and not bound to the build-time of webpack.
For that, we added rudimentary support for environment variables to this package. 

Environment Variables are only available for SSR apps by default and are implemented in the expressSsrPlugin.
You can access the variables on ```window.VUE_ENV``` in the frontend and on ```vueContext.VUE_ENV``` in your SSR app's context.

Environment variables have to be whitelisted in your SSR plugin configuration. Take a look at "SSR Options" to learn how you can configure the express SSR plugin.

## Options

### useSsr

When you want to use your app with SSR and vue.js's bundle renderer, you have to set the "useSsr" to true.
This will enable the generation of the server and client manifest files that are required for the renderer.
```
{
    "labor": {
        "apps": [
            {
                ...
                "useSsr": true,
                ...
            }
        ]
    }
}
```

### useCssExtractPlugin

By default, the "mimiCssExtract" plugin will be disabled in order to allow hot reloading for the Vue components. 
If you are using a legacy project in combination with Vue, you may set this to FALSE. In that case, all CSS files will be dumped, even if in development.

```
{
    "labor": {
        "apps": [
            {
                ...
                "useCssExtractPlugin": false,
                ...
            }
        ]
    }
}
```

## SSR Options

It is possible to pass additional configuration to the SSR express plugin.
Just call the "configure" method instead of passing the plugin through to the promise handler.

### envVars

Defines an array of environment variables that should be passed from the SSR to your App on the server **AND ON THE CLIENT SITE**. 
Please make sure that you don't make critical secrets public! You can access the variables on ```window.VUE_ENV``` in the frontend and on ```vueContext.VUE_ENV``` in your SSR app's context.
```
expressAssetBuildingPlugin(app)
    .then(expressSsrPlugin.configure({
         envVars: ["MY_VAR"]
    }));
```

### additionalEnvVars

A list of key-value pairs that will be automatically injected into the object at process.vueSsrEnv.
They will be available in your browser app and your SSR context, so be careful!
```
expressAssetBuildingPlugin(app)
    .then(expressSsrPlugin.configure({
         additionalEnvVars: {
            "MY_KEY": "myValue"
         }
    }));
```

### vueContextFilter

Can be used to modify the Vue context object before it is passed to the bundle renderer
```
expressAssetBuildingPlugin(app)
    .then(expressSsrPlugin.configure({
         vueContextFilter: function(context) {
            context.myVar = foo
         }
    }));
```

### streamWrapper

The stream wrapper will be called on every chunk that is outputted by Vue's bundle renderer.
It can be used to replace dynamic markers in the HTML before it is passed to the response object.
```
expressAssetBuildingPlugin(app)
    .then(expressSsrPlugin.configure({
         streamWrapper: function(chunk, context) {
              return chunk.replace(/a/g, "b");
         }
    }));
```

### externalWhitelist
Allows you to define the regex that is used to whitelist
node_module files that can be build by webpack, everything else is directly loaded
from the node_modules directory on your server.

Default: /\.css$|\.vue$|[\\\/]src[\\\/]|[\\\/]source[\\\/]/

## Postcardware

You're free to use this package, but if it makes it to your production environment, we highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany.

We publish all received postcards on our [company website](https://labor.digital). 
