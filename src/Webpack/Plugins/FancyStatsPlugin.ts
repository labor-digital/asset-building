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
 * Last modified: 2020.10.21 at 17:31
 */

import {isString, PlainObject} from '@labor-digital/helferlein';
import Chalk from 'chalk';
// @ts-ignore
import webpack, {Compiler} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';
import {FileHelpers} from '../../Helpers/FileHelpers';
import type {
    AssetBuilderWebpackPluginInterface,
    AssetBuilderWebpackPluginStaticInterface
} from './AssetBuilderWebpackPluginInterface';
// @ts-ignore
import ToJsonOutput = webpack.Stats.ToJsonOutput;

// Define column char lengths
const assetColLength = 70;
const sizeColLength = 14;

export const FancyStatsPlugin: AssetBuilderWebpackPluginStaticInterface =
    class implements AssetBuilderWebpackPluginInterface
    {
        /**
         * The worker context this plugin should render the output for
         * @protected
         */
        protected _context?: WorkerContext;
        
        protected _numberOfWarnings = 0;
        protected _numberOfErrors = 0;
        
        public setContext(context: WorkerContext)
        {
            this._context = context;
        }
        
        public apply(compiler: Compiler)
        {
            compiler.hooks.done.tap('FancyStatsPlugin', (statsRaw) => {
                let stats = statsRaw.toJson({
                    assets: true,
                    errorDetails: false,
                    publicPath: true
                });
                
                this._numberOfErrors = 0;
                this._numberOfWarnings = 0;
                
                // Build the output
                const output: Array<string> = [];
                this.renderHeader(output);
                this.renderAssetList(output, stats);
                this.renderWarnings(output, stats);
                this.renderErrors(output, stats);
                this.renderFooter(output);
                console.log(output.join('\r\n'));
            });
        }
        
        /**
         * Renders the header of an output list
         * @param output
         * @protected
         */
        protected renderHeader(output: Array<string>): void
        {
            output.push('');
            output.push('COMPILING DONE: ' + (new Date().toLocaleTimeString()));
            output.push(this.drawLine());
        }
        
        /**
         * Renders the list of generated assets in this build process
         * @param output
         * @param stats
         * @protected
         */
        protected renderAssetList(output: Array<string>, stats: ToJsonOutput): void
        {
            let time = stats.time > 5000 ? Math.round(stats.time / 100) / 10 + 's' : stats.time + 'ms';
            
            output.push(this._context!.app.appName +
                        (isString(this._context!.webpackConfig.target)
                            ? ' (' + this._context!.webpackConfig.target + ')'
                            : '') +
                        ' | Time: ' + time);
            output.push('Asset'.padStart(assetColLength, ' ') + '  ' + 'Size'.padStart(sizeColLength));
            
            let ignoredChunks = 0;
            let ignoredSize = 0;
            
            stats.assets.forEach((asset: PlainObject) => {
                const isMap = asset.name.match(/\.map$/);
                const isHotUpdate = asset.name.match(/\.hot-update\./);
                const chunkIsMain = typeof asset.chunks[0] === 'string' &&
                                    (asset.chunks[0] as string).indexOf('main') === 0;
                const chunkNameIsMain = typeof asset.chunkNames[0] === 'string' &&
                                        asset.chunkNames[0].indexOf('main') === 0;
                const useAsset = (this._context!.app.verboseResult || !isMap && !isHotUpdate &&
                                  (chunkIsMain || chunkNameIsMain));
                
                if (!useAsset) {
                    ignoredChunks++;
                    ignoredSize += asset.size;
                    return;
                }
                let realAssetName = (stats.outputPath + '/' + asset.name).replace(/[\\\/]/g, '/');
                output.push(
                    Chalk.greenBright(realAssetName.substr(-(assetColLength - 5)).padStart(assetColLength)) + '  '
                    + FileHelpers.humanFileSize(asset.size).padStart(sizeColLength));
            });
            
            if (ignoredChunks !== 0) {
                output.push(('  + ' + ignoredChunks + ' hidden files (maps, chunks, assets, and so on)').padStart(
                    assetColLength) + '  ' +
                            FileHelpers.humanFileSize(ignoredSize).padStart(sizeColLength));
            }
            
        }
        
        /**
         * Renders the list of ocurred warnings if there are any
         * @param output
         * @param stats
         * @protected
         */
        protected renderWarnings(output: Array<string>, stats: ToJsonOutput): void
        {
            if (stats.warnings.length > 0) {
                this._numberOfWarnings += stats.warnings.length;
                output.push(this.drawLine('.'));
                output.push('');
                output.push(Chalk.yellowBright('BEWARE! There are warnings!'));
                output.push('');
                stats.warnings.forEach((entry: PlainObject, i: number) => {
                    if (i > 0) {
                        output.push('');
                    }
                    output.push(Chalk.yellowBright(this.renderErrorOrWarning(entry)));
                });
            }
        }
        
        /**
         * Renders the list of ocurred errors if there are any
         * @param output
         * @param stats
         * @protected
         */
        protected renderErrors(output: Array<string>, stats: ToJsonOutput): void
        {
            if (stats.errors.length > 0) {
                this._numberOfErrors += stats.errors.length;
                output.push(this.drawLine('.'));
                output.push('');
                output.push(Chalk.redBright('MISTAKES HAVE BEEN MADE!'));
                output.push('');
                stats.errors.forEach((entry: PlainObject, i: number) => {
                    if (i > 0) {
                        output.push('');
                    }
                    output.push(Chalk.redBright(this.renderErrorOrWarning(entry)));
                });
            }
        }
        
        /**
         * Converts the given error/warning object into a string
         * @param msg
         * @protected
         */
        protected renderErrorOrWarning(msg: PlainObject): string
        {
            const lines: Array<string> = [];
            
            if (isString(msg.moduleName)) {
                lines.push('Error in module: ' + msg.moduleName);
            }
            if (isString(msg.message)) {
                lines.push(msg.message);
            }
            
            return lines.join('\n');
        }
        
        /**
         * Renders the footer to the output
         * @param output
         * @protected
         */
        protected renderFooter(output: Array<string>): void
        {
            output.push(this.drawLine());
            let state = this._numberOfWarnings === 0 && this._numberOfErrors === 0 ? Chalk.greenBright('OK') : '';
            if (this._numberOfWarnings > 0) {
                state = Chalk.yellowBright(
                    this._numberOfWarnings + ' warning' + (this._numberOfWarnings === 1 ? '' : 's')
                );
            }
            
            if (this._numberOfWarnings !== 0 && this._numberOfErrors !== 0) {
                state += ' | ';
            }
            
            if (this._numberOfErrors > 0) {
                state += Chalk.redBright(
                    this._numberOfErrors + ' error' + (this._numberOfErrors === 1 ? '' : 's')
                );
            }
            output.push(new Date().toLocaleTimeString() + ' | ' + state);
            output.push('');
        }
        
        /**
         * Helper which draws a line for "design" purposes
         * @param char
         */
        protected drawLine(char?: string): string
        {
            char = typeof char === 'string' ? char : '=';
            return char.repeat(90);
        }
    };