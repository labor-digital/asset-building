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
 * Last modified: 2019.02.18 at 18:55
 */
import {isString} from "@labor-digital/helferlein/lib/Types/isString";
import fs from "fs";
import path from "path";

export class FileHelpers {

	static writeFile(filename: string, content: string): void {
		fs.writeFileSync(filename, content);
	}

	static readFile(filename: string): string {
		return fs.readFileSync(filename).toString("utf-8");
	}

	static unifyFilename(filename: string): string {
		if (!isString(filename)) return filename;
		// Make sure windows drives are unified to lowercase
		if (filename.charAt(1) === ":") {
			filename = filename.charAt(0).toLowerCase() + filename.substr(1);
		}
		return path.normalize(filename);
	}

	static getFileExtension(filename: string): string {
		if (!isString(filename)) return filename;
		return FileHelpers.stripOffQuery(filename.replace(/^(.*?\.)([^.\\\/]*)$/, "$2").toLowerCase());
	}

	static stripOffQuery(filename: string): string {
		if (!isString(filename)) return filename;
		return filename.replace(/[?#].*?$/, "");
	}

	static getFileWithoutExtension(filename: string): string {
		if (!isString(filename)) return filename;
		const ext = FileHelpers.getFileExtension(filename);
		return filename.replace(new RegExp("\\." + ext + "$"), "");
	}

	static filenameToPosix(filename: string): string {
		if (!isString(filename)) return filename;
		return FileHelpers.unifyFilename(filename).replace(/\\/g, "/");
	}

	static humanFileSize(size: number): string {
		var i: number = Math.floor(Math.log(size) / Math.log(1024));
		return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][i];
	}

	/**
	 * @see https://gist.github.com/bpedro/742162#gistcomment-828133
	 * @param {string} directory The directory to create
	 */
	static mkdir(directory): void {
		if (!isString(directory)) return;
		var path = directory.replace(/[\\\/]/g, "/").replace(/\/$/, "").split("/");

		for (var i = 1; i <= path.length; i++) {
			var segment = path.slice(0, i).join("/");
			if (segment === "" || segment === undefined) continue;
			!fs.existsSync(segment) ? fs.mkdirSync(segment) : null;
		}
	}

	static flushDirectory(directory): void {
		if (!isString(directory)) return;
		try {
			var files = fs.readdirSync(directory);
		} catch (e) {
			return;
		}
		if (files.length > 0) {
			for (var i = 0; i < files.length; i++) {
				var filePath = directory + "/" + files[i];
				if (fs.statSync(filePath).isFile())
					fs.unlinkSync(filePath);
				else {
					this.flushDirectory(filePath);
					fs.rmdirSync(filePath);
				}
			}
		}
	};

	static touch(filename): void {
		if (!isString(filename)) return;
		if (!fs.existsSync(filename)) fs.writeFileSync(filename, "");
		fs.utimesSync(filename, new Date(), new Date());
	}
}