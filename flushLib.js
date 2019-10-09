/*
 * Copyright 2019 LABOR.digital
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
 * Last modified: 2019.03.18 at 15:12
 */
const fs = require("fs");
const path = require("path");

function rmdirRecursive(dirname, removeSelf) {
	if (fs.existsSync(dirname)) {
		fs.readdirSync(dirname).forEach(function (file, index) {
			var curPath = dirname + path.sep + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				rmdirRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		if (removeSelf !== false) fs.rmdirSync(dirname);
	}
}

try {
	rmdirRecursive(__dirname + "/dist", false);
} catch (e) {
	console.error("Failed to clear dist!");
}