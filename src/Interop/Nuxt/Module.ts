/*
 * Copyright 2020 LABOR.digital
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
 * Last modified: 2020.10.20 at 17:25
 */

import {GeneralHelper} from "../../Helpers/GeneralHelper";
import {NuxtFactory} from "./NuxtFactory";

export default function Module(options) {
	this.nuxt.hook("webpack:config", function (configs) {
		GeneralHelper.renderFancyIntro();
		return new NuxtFactory(options).enhanceWebpackConfigs(configs);
	});
}