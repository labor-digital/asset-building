# Configuration
The webpack configuration depends on the selected version of the config builder.
There are small example configurations to take a look at for version 1.0 at
`demo1/package.json` or at `demo2/package.json` for version 2.0. 

In general, you begin the configuration by adding a new node called "labor"
to your package.json:
```
{
  "name": "your-app",
  "version": "1.0.0",
  [...]
  "labor": {
    ** Your Config goes here **
  }
}
```

### builderVersion
This is used to switch the internal config builder version. 
If it is empty / not given the default config builder is version 1.0.
Take a look at **Different config builder versions** if you don't know what 
this is about. If you want to use version 2.0 just specify it using:
```
"labor": {
    "builderVersion": 2,
    "apps": [...]
}
```

### runWorkersSequential
By default the build processes / app definitions will be called async and in parallel. Which leads to much
faster build times as webpack runs on separate threads.

If you want the worker to run sequential (finish app 1, then start app 2, finish app 2 then start app 3...),
you can set this to TRUE. This is TRUE by default for builderVersion 1 and FALSE by default for version 2.
```
"labor": {
    [...],
    "runWorkersSequential": TRUE
}
```

### extensions
With the given set of tools you should be able to do the same stuff you did with our 
old gulpfile without problems. But if you want to dive deeper, or want to edit 
the webpack config manually you can use either the "webpackConfig" option or
create an extension that can use the provided hooks to alter the configuration.

Extensions are mend to create reusable extensions to the asset builder that may 
require their own webpack plugins or loaders, while the "webpackConfig" option
is intended an "per-project" alternative that requires no further understanding of the
structure. 

Extensions can supplied either as "global" extension in the labor root, or as
a "per-app" extension if you using builderVersion 2.

For more information take look at the **Extension.md** file.
```
"labor": {
    "extensions": [
        "./extensions/MyDemoExtension.js",
        "@labor-digital/your-packge/asset-building"
    ]
}
```