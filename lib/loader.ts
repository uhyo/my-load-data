///<reference path='../typings/bundle.d.ts'/>

import {Promise} from 'es6-promise';

import * as fs from 'fs';
import * as path from 'path';

import jsonLoader from './loaders/json';
import yamlLoader from './loaders/yaml';
import jsLoader from './loaders/js';

interface IExtTable{
    [ext: string]: (path: string)=>any;
}
interface NumberConstructor{
    isFinite(n: any): boolean;
}

export interface IOption{
    mtime?: boolean | string;
    cache?: any;
    nocacheFilter?: RegExp | ((file: string)=>boolean);
}
interface IOption2{
    mtime: string;
    cache: any;
    nocacheFilter: (file: string)=>boolean;
}

const DEFAULT_MTIME_FIELD = '$mtime';

const defaultExtTable: IExtTable = {
    '.json': jsonLoader,
    '.yaml': yamlLoader,
    '.yml': yamlLoader,
    '.js': jsLoader,
};

export class Loader{
    private extTable: IExtTable;
    constructor(){
        this.extTable = (Object as any).assign({}, defaultExtTable);
    }

    public fromDirectory(dir: string | Array<string>, options: IOption = {}): Promise<any>{
        // default values for options
        const options2 = this.readOptions(options);
        const result: any = {};
        if ('string'===typeof dir){
            return this.fromDirectory1(dir as string, result, options2, options2.cache);
        }else if (Array.isArray(dir)){
            // 順番にディレクトリを処理
            const h = (i: number)=>{
                const d = dir[i];
                if (d == null){
                    return Promise.resolve(result);
                }
                return this.fromDirectory1(d, result, options2, options2.cache).then(_=>{
                    return h(i+1);
                });
            };
            return h(0);
        }else{
            return Promise.reject(new Error('Invalid parameter'));
        }
    }
    private fromDirectory1(dir: string, target: any, options: IOption2, cache: any): Promise<any>{
        return new Promise((resolve, reject)=>{
            fs.readdir(dir, (err, files)=>{
                if (err != null){
                    reject(err);
                    return;
                }
                let mtime = -Infinity;
                const mtimef: string = 'string' === typeof options.mtime ? options.mtime as string : DEFAULT_MTIME_FIELD;
                const h = (i: number)=>{
                    const f = files[i];
                    if (f == null){
                        if (nisFinite(mtime)){
                            target[mtimef] = mtime;
                        }
                        return Promise.resolve(target);
                    }
                    const pa = path.join(dir, f);
                    const base = path.basename(f, path.extname(f));
                    return this.fromFile1(pa, options, cache && cache[base]).then(v=>{
                        if (v !== void 0){
                            target[base] = v;
                        }
                        // ディレクトリ中で最大のmtimeを調べている
                        if (options.mtime){
                            if (nisFinite(v[mtimef])){
                                // 更新日時情報持ってる
                                if (mtime < v[mtimef]){
                                    mtime = v[mtimef];
                                }
                                return h(i+1);
                            }else{
                                // 無いから取得しないと
                                return getMTime(pa).then(mt=>{
                                    if (nisFinite(mt) && mtime < mt){
                                        mtime = mt;
                                    }
                                    return h(i+1);
                                });
                            }
                        }
                        return h(i+1);
                    });
                };
                resolve(h(0));
            });
        });
    }
    public fromFile(pa: string, options: IOption = {}): Promise<any>{
        const options2 = this.readOptions(options);
        return this.fromFile1(pa, options2, options2.cache);
    }
    private fromFile1(pa: string, options: IOption2, cache: any): Promise<any>{
        // mtimeを取得
        return getMTime(pa).then(fmtime=>{
            if (fmtime===-1){
                // ディレクトリだった
                return this.fromDirectory1(pa, {}, options, cache);
            }
            // cacheを確認
            const mtimef = 'string' === typeof options.mtime ? (options.mtime as string) : DEFAULT_MTIME_FIELD;
            if (options.cache && cache && !options.nocacheFilter(pa) && nisFinite(cache[mtimef]) && nisFinite(fmtime) && cache[mtimef] >= fmtime){
                // cacheを利用可能
                // TODO: deep cloning?
                return cache;
            }
            // loaderを取得
            const ext = path.extname(pa);
            const f = this.extTable[ext];
            if ('function'===typeof f){
                const par = path.resolve(pa);
                const p = f(par);
                if (options.mtime){
                    // mtimeが必要
                    return p.then(obj=>{
                        if (obj != null && 'object' === typeof obj){
                            obj[mtimef] = fmtime;
                        }
                        return obj;
                    });
                }else{
                    return p;
                }
            }else{
                return (void 0);
            }
        });
    }

    public addHandler(ext: string, func: (path: string)=>any): void{
        ext = ext[0]==='.' ? ext : '.'+ext;
        this.extTable[ext] = func;
    }

    private readOptions(options: IOption): IOption2{
        // set default values for options.
        let {
            mtime,
            cache,
            nocacheFilter,
        } = options;

        if (cache === true || cache != null && 'object'===typeof cache){
            // cache: trueはmtime: trueと同じ意味
            mtime = true;
            if (cache === true){
                cache = void 0;
            }
        }
        let nocacheFilterFunc: (filename: string)=>boolean;
        if (nocacheFilter instanceof RegExp){
            nocacheFilterFunc = (filename: string)=> nocacheFilter.test(filename);
        }else if ('function' === typeof nocacheFilter){
            nocacheFilterFunc = nocacheFilter;
        }else{
            nocacheFilterFunc = ()=>false;
        }
        return {
            // mtime: boolean or string.
            mtime: mtime ? (options.mtime = 'string'===typeof mtime ? (mtime as string) : DEFAULT_MTIME_FIELD) : void 0,
            // cache
            cache: cache || void 0,
            // default filter is all passing
            nocacheFilter: nocacheFilterFunc,
        };
    }
}

// some util functions
function nisFinite(n: any): boolean{
    return (Number as any).isFinite(n);
}
// get mtime of file. null if (file was not found) or -1 if (it is directory).
function getMTime(file: string): Promise<number>{
    return new Promise((resolve, reject)=>{
        fs.stat(file, (err, st)=>{
            if (err != null){
                if (err.code === 'ENOENT'){
                    resolve(null);
                }else{
                    reject(err);
                }
                return;
            }
            if (st.isDirectory()){
                resolve(-1);
            }else{
                resolve(st.mtime.getTime());
            }
        });
    });
}
