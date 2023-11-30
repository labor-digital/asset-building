# Asset - Building

This package provides you with the whole suitcase of modern asset building for the web. Build on top of webpack it goes a similar root as [encore](https://github.com/symfony/webpack-encore) or [mix](https://laravel.com/docs/7.x/mix) but with almost zero configuration on your part. 
We use this builder for all of our projects from traditional monolithic javascript, over jQuery, Vue.js, and Typescript (It can't cook you a coffee, tho!).
If the base distribution does not meet your requirements, it is possible to extend it using the built-in hook system or by writing your webpack config.

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

## Documentation

The documentation can be found [here](https://asset-building.labor.tools).

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

You're free to use this package, but if it makes it to your production environment we highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany

We publish all received postcards on our [company website](https://labor.digital). 