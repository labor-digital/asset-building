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
 * Last modified: 2021.03.31 at 13:18
 */

import {EventEmitter, forEach, isUndefined} from '@labor-digital/helferlein';
import Inquirer from 'Inquirer';
import type BottomBar from 'inquirer/lib/ui/bottom-bar';
import {debounce} from 'throttle-debounce';
import {EventList} from '../../EventList';
import type {IO} from '../IO';
import type {TBarMap} from './types';

export class Renderer
{
    protected _bars: TBarMap;
    protected _bottomBar!: BottomBar;
    
    protected _logRestorer?: Function;
    protected _renderCallback: any;
    
    constructor(eventEmitter: EventEmitter, bars: TBarMap)
    {
        this._bars = bars;
        this._bottomBar = new Inquirer.ui.BottomBar();
        
        // Tell bottom bar we don't want it to listen to anything...
        // @ts-ignore
        this._bottomBar.rl.removeListener('SIGINT', this._bottomBar.onForceClose);
        // @ts-ignore
        process.removeListener('exit', this._bottomBar.onForceClose);
        // ... because we do that ourselves
        this.registerShutdown(eventEmitter);
        
        // Limit the re-rendering, to avoid flickering of the loading bar
        const fps = 15;
        this._renderCallback = debounce((1000 / fps), () => {
            this.renderInternal();
        });
    }
    
    /**
     * Renders the progress bars at the bottom of the cli output
     * @param force If set to true, the script will rerender the bars, and ignore the internal fps limit.
     */
    public render(force?: boolean): void
    {
        if (force || true) {
            this.renderInternal();
            return;
        }
        
        this._renderCallback();
    }
    
    /**
     * Actual renderer for the progress bars
     * @protected
     */
    protected renderInternal()
    {
        const barCompleteChar = '\u2588';
        const barIncompleteChar = '\u2591';
        const length = 30;
        
        const bars: Array<string> = [];
        
        forEach(this._bars, (bar, name) => {
            // Ignore bars that have been finished
            if (bar.percent === 1) {
                return;
            }
            
            const completeLength = Math.ceil(Math.min(length, Math.max(0, bar.percent)) * length);
            const incompleteLength = Math.max(0, length - completeLength);
            
            if (isUndefined(name)) {
                console.error(bar, bars, this._bars);
                process.exit();
            }
            
            bars.push(name + ' ' +
                      barCompleteChar.repeat(completeLength) + barIncompleteChar.repeat(incompleteLength) +
                      (bar.message !== '' ? ' | ' + bar.message : ''));
        });
        
        this._bottomBar.updateBottomBar(bars.join('\r\n'));
    }
    
    /**
     * Writes an output to the inquirer stdout without breaking the progress bars
     * @param args
     */
    public log(...args: any): void
    {
        this._bottomBar.log.write(args.join(' '));
    }
    
    /**
     * Replaces the default log writer of the io stream with our log writer
     * The original writer will be restored when the shutdown is started
     * @param io
     */
    public registerLogWriter(io: IO): void
    {
        const originalWriter = io.setLogWriter((...args) => {
            this.log(...args);
        });
        
        this._logRestorer = () => {
            io.setLogWriter(originalWriter);
            delete this._logRestorer;
        };
    }
    
    /**
     * Registers the shutdown handler which will close bottom bar and restore the cli to its original state
     * @param eventEmitter
     * @protected
     */
    protected registerShutdown(eventEmitter: EventEmitter): void
    {
        eventEmitter.bind(EventList.SHUTDOWN, () => {
            if (this._logRestorer) {
                this._logRestorer();
            }
            
            if (!this._bottomBar) {
                return;
            }
            
            // @ts-ignore
            this._bottomBar.close();
            // @ts-ignore
            delete this._bottomBar;
        });
    }
}