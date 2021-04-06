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
 * Last modified: 2021.03.26 at 09:48
 */
const {assets} = require('@labor-digital/asset-building/interop/express');
const express = require('express');

const app = express();
const port = 8000;

// Using the devServer option the asset builder will automatically inject the webpack dev middleware
// into your application, so you don't have to do anything. If you are running the script in a "production" environment,
// the output directory will be served automatically
assets(app, {devServer: true, verbose: true})
    .then(() => {
        
        app.listen(port, () => console.log(`Example app listening on port ${port}!`));
        
    });

