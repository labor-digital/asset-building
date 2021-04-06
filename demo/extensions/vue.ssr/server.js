/*
 * Copyright 2021 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2021.03.29 at 20:28
 */

const express = require('express');
const {assets} = require('@labor-digital/asset-building/interop/express');
const {vue} = require('@labor-digital/asset-building-env-vuejs/interop/express');

const app = express();
const port = 8000;

// Demo for environment setting
if (process.argv[2] === 'development') {
    process.env.NODE_ENV = 'development';
}

// Create the express asset builder context
assets(app, {verbose: true})
    .then(context => {
        
        // Register your custom routes, those will not reach the expressSsrPlugin!
        context.expressApp.get('/test', (req, res) => {
            res.send('Not served by dev server!');
        });
        
        // This is the magic that registers the vue ecosystem to your app
        // Mind the "Return" statement, please!
        return vue(context);
        
    })
    .then(context => {
        context.expressApp.listen(port, () => console.log(`Example app listening on port ${port}!`));
    });
