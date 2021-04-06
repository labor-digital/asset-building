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

import {forEach, isString, PlainObject} from '@labor-digital/helferlein';
import Chalk from 'chalk';
import type {Compiler, StatsCompilation} from 'webpack';
import type {WorkerContext} from '../../Core/WorkerContext';
import {FileHelpers} from '../../Helpers/FileHelpers';
import type {IAssetBuilderPlugin, IAssetBuilderPluginStatic} from './types';

// Define column char lengths
const assetColLength = 70;
const sizeColLength = 14;

export const FancyStatsPlugin: IAssetBuilderPluginStatic = class implements IAssetBuilderPlugin
{
    /**
     * The worker context this plugin should render the output for
     * @protected
     */
    protected _context?: WorkerContext;
    
    protected _numberOfWarnings = 0;
    protected _numberOfErrors = 0;
    
    protected _dumpTimeout: number | any = 0;
    
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
            this.renderAssetList(output, stats);
            this.renderWarnings(output, stats);
            this.renderErrors(output, stats);
            this.renderFooter(output);
            
            // Avoid duplicate output rendering when webpack decides to somehow stagger this output o.O
            const render = () => this._context?.parentContext.io.writeRaw(output.join('\r\n'));
            if (this._context?.webpackConfig.watch) {
                clearTimeout(this._dumpTimeout);
                this._dumpTimeout = setTimeout(() => render(), 350);
            } else {
                render();
            }
        });
    }
    
    /**
     * Renders the list of generated assets in this build process
     * @param output
     * @param stats
     * @protected
     */
    protected renderAssetList(output: Array<string>, stats: StatsCompilation): void
    {
        let time = stats.time! > 5000 ? Math.round(stats.time! / 100) / 10 + 's' : stats.time + 'ms';
        
        output.push(this.drawLine());
        output.push(this._context!.app.appName +
                    (isString(this._context!.webpackConfig.target)
                        ? ' (' + this._context!.webpackConfig.target + ')'
                        : '') +
                    ' | Time: ' + time + ' | ' + (new Date().toLocaleTimeString()));
        
        output.push(this.drawLine('-'));
        output.push('Asset'.padStart(assetColLength, ' ') + '  ' + 'Size'.padStart(sizeColLength));
        
        let ignoredChunks = 0;
        let ignoredSize = 0;
        
        if (stats.assets) {
            stats.assets.forEach((asset: PlainObject) => {
                const isMap = asset.name.match(/\.map$/);
                const isHotUpdate = asset.name.match(/\.hot-update\./);
                const chunkIsMain = typeof asset.chunks[0] === 'string' &&
                                    (asset.chunks[0] as string).indexOf('main') === 0;
                const chunkNameIsMain = typeof asset.chunkNames[0] === 'string' &&
                                        asset.chunkNames[0].indexOf('main') === 0;
                
                const useAsset = (!isMap && !isHotUpdate && (chunkIsMain || chunkNameIsMain)) ||
                                 this._context?.parentContext.options.verbose;
                
                if (!useAsset) {
                    ignoredChunks++;
                    ignoredSize += asset.size;
                    return;
                }
                
                let realAssetName = (stats.outputPath + '/' + asset.name).replace(/[\\\/]/g, '/');
                
                const lines = [];
                const parts = realAssetName.split('/').reverse();
                let line: Array<string> = [];
                let first = true;
                let lineLength = 1; // 1 for the trailing slash
                forEach(parts, part => {
                    let newLineLength = lineLength + (part.length + 1);
                    if (newLineLength > assetColLength) {
                        lines.push((line.reverse().join('/') + (!first ? '/...' : '')).padStart(assetColLength));
                        first = false;
                        line = [];
                        lineLength = 1;
                    }
                    lineLength += part.length + 1;
                    line.push(part);
                });
                
                lines.push((line.reverse().join('/') + (!first ? '/...' : '')).padStart(assetColLength));
                const outputAssetName = lines.reverse().join('\n');
                
                output.push(
                    Chalk.greenBright(outputAssetName) + '  '
                    + FileHelpers.humanFileSize(asset.size).padStart(sizeColLength));
            });
        }
        
        if (ignoredChunks !== 0) {
            output.push(('  + ' + ignoredChunks + ' hidden files (maps, chunks, assets, and so on)').padStart(
                assetColLength) + '  ' +
                        FileHelpers.humanFileSize(ignoredSize).padStart(sizeColLength));
        }
        
    }
    
    /**
     * Renders the list of occurred warnings if there are any
     * @param output
     * @param stats
     * @protected
     */
    protected renderWarnings(output: Array<string>, stats: StatsCompilation): void
    {
        if (stats.warnings && stats.warnings.length > 0) {
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
    protected renderErrors(output: Array<string>, stats: StatsCompilation): void
    {
        if (stats.errors && stats.errors.length > 0) {
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