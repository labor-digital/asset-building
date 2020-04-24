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
 * Last modified: 2020.04.02 at 10:04
 */

module.exports = {
	title: "Asset Building by LABOR.digital",
	themeConfig: {
		sidebarDepth: 2,
		sidebar: [
			"/",
			"/guide/CoreFeatures.md",
			"/guide/ConfigGeneral.md",
			"/guide/ConfigV1.md",
			"/guide/ConfigV2.md",
			"/guide/Extensions.md",
			"/guide/Interop.md",
			"/guide/MigratingFromGulp.md"
		],
		nav: [
			{text: "GitHub", link: "https://github.com/labor-digital/asset-building"},
			{text: "npm", link: "https://www.npmjs.com/package/@labor-digital/asset-building"}
		]
	}
};