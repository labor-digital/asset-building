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
 * Last modified: 2021.03.27 at 00:07
 */

let el = document.createElement('div');

if (module.hot) {
    module.hot.accept();
    
    module.hot.dispose((data) => {
        data.el = el;
    });
    
    if (module.hot.data && module.hot.data.el) {
        el = module.hot.data.el;
    }
}

if (!el.parentElement) {
    setTimeout(() => document.body.appendChild(el), 5);
}

// Change this, wile running a dev server, to see it hot-reload
el.innerText = 'Sub-Text!';
