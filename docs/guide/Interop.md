# Cross Project Interoperability
As a webpack configurator, the asset builder can not only be used as a 
stand-alone bundling solution but can also be used as a configuration for other software, built on top of webpack.

The asset builder provides so-called "interop" functionality as part of the core distribution.

## Express
You can use the asset builder as part of your webpack application, like we do in the [dev server extension](https://www.npmjs.com/package/@labor-digital/asset-building-dev-server).
There we use the builder as configurator and register the webpack hot-reload and dev middlewares directly into your express application.

If you want your own implementation you can use the same logic like:

```javascript
const expressAssetBuildingPlugin = require("@labor-digital/asset-building/dist/Interop/Express/expressAssetBuildingPlugin.js");
const express = require("express");
const app = express();
const port = 8000;

// Demo for environment setting
if (process.argv[2] === "development") process.env.NODE_ENV = "development";

// Apply the dev server plugin to the app
expressAssetBuildingPlugin(app)
   .then((context) => {
       // The "context" object is the API to access the webpack configuration features
        // If you would want to generate the webpack config you could use
        context.factory.getWebpackConfig().then(webpackConfig => {
            // Here you can do what you want with the webpack configuration
        })

        // Or you can run the compiler instance yourself
        context.factory.getWebpackCompiler().then(webpackCompiler => {
            webpackCompiler.run(() => {});
        });
    })
   .then(() => {
      app.get("/", (req, res) => {
         res.send("Not served by dev server!");
      });
      app.listen(port, () => console.log(`Example app listening on port ${port}!`));
   });

```

## Storybook
[Storybook](https://storybook.js.org/) is a powerful tool for developing UI components. It is also built on top of webpack,
so you can also use the asset builder to provide all the functionality you know of the asset-builder in your storybook projects.

We provide Storybook with the required configuration to follow those simple steps:

- install the asset builder to your project
- open your ``.storybook/main.js``
- add the asset-builder addon **as the first entry** of the list of addons: ``@labor-digital/asset-building/dist/Interop/Storybook/registration``
- restart Storybook, and you now use the asset builder webpack configuration

### App Configuration
**Inside of Storybook we don't use the package JSON to collect information as we are just providing the required
information to Storybook's webpack!**

However you can provide all options to you normally would by using storybooks options API.
If you want the vue.js extension for the asset builder, you can register it as follows:

```javascript
module.exports = {
   stories: ['../stories/**/*.stories.js'],
   addons: [
      {
         name: '@labor-digital/asset-building/dist/Interop/Storybook/registration',
         options: {
            // In "app" you can use all the options you find in the "V2" config options
                app: {
                    extensions: ["@labor-digital/asset-building-env-vuejs"]
                }
         }
      }
      //...
   ]
};
``` 

### Disabled Configurators
To provide smooth integration into the storybook environment, we disabled some of the default configuration providers,
as they are not required in a storybook context. 
The following configurators are disabled:

- **BASE**: Basic webpack setup (already done by Storybook)
- **APP_PATHS**: Setup of entry and output path's (already done by Storybook)
- **PROGRESS_BAR_PLUGIN**: Visible feedback of the build process (already done by Storybook)
- **CSS_EXTRACT_PLUGIN**: Extraction of CSS code into .css files (not required in storybook)
- **CLEAN_OUTPUT_DIR_PLUGIN**: Clean up the output directory before a build (not required in Storybook)
- **COPY_PLUGIN**: Copy assets into the output directory (not required in Storybook)
- **MIN_CHUNK_SIZE_PLUGIN**: configure the minimal asset chunk size (does not work in Storybook)
- **BUNDLE_ANALYZER_PLUGIN**: allows the "analyze" command to run (not required in Storybook)
- **HTML_PLUGIN**: Build the initial HTML to render an app (already done by Storybook)
- **JS_PRE_LOADER**: Registers polyfills (not required in Storybook)
