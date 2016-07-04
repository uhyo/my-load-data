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
        const result: any = {};
        if ('string'===typeof dir){
            return this.fromDirectory1(dir as string, result, options);
        }else if (Array.isArray(dir)){
            // 順番にディレクトリを処理
            const h = (i: number)=>{
                const d = dir[i];
                if (d == null){
                    return Promise.resolve(result);
                }
                return this.fromDirectory1(d, result, options).then(_=>{
                    return h(i+1);
                });
            };
            return h(0);
        }else{
            return Promise.reject(new Error('Invalid parameter'));
        }
    }
    private fromDirectory1(dir: string, target: any, options: IOption = {}): Promise<any>{
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
                    return this.fromFile(pa, options).then(v=>{
                        if (v !== void 0){
                            target[base] = v;
                        }
                        // ディレクトリ中で最大のmtimeを調べている
                        if (options.mtime){
                            if (nisFinite(v[mtimef])){
                                if (mtime < v[mtimef]){
                                    mtime = v[mtimef];
                                }
                            }else{
                                // mtimeが欲しいのにないからファイルから調べる
                                return (new Promise((resolve, reject)=>{
                                    fs.stat(pa, (err, st)=>{
                                        if (err != null){
                                            reject(err);
                                            return;
                                        }
                                        const mt = st.mtime.getTime();
                                        if (mtime < mt){
                                            mtime = mt;
                                        }
                                        resolve(h(i+1));
                                    });
                                }));
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
        return new Promise((resolve, reject)=>{
            fs.stat(pa, (err, st)=>{
                if (err != null){
                    reject(err);
                    return;
                }
                if (st.isDirectory()){
                    // ちょーーーーこれディレクトリなんですけどーーーーーーーーーーー
                    const obj: any = {};
                    resolve(this.fromDirectory1(pa, obj, options));
                    return;
                }else{
                    const ext = path.extname(pa);
                    const f = this.extTable[ext];
                    if ('function'===typeof f){
                        const par = path.resolve(pa);
                        const p = f(par);
                        if (options.mtime){
                            // mtimeが必要
                            const mtimef = 'string' === typeof options.mtime ? (options.mtime as string) : DEFAULT_MTIME_FIELD;
                            resolve(p.then(obj=>new Promise((resolve, reject)=>{
                                fs.stat(par, (err, st)=>{
                                    if (err != null){
                                        reject(err);
                                    }else{
                                        if (obj != null && 'object'===typeof obj){
                                            obj[mtimef] = st.mtime.getTime();
                                        }
                                        resolve(obj);
                                    }
                                });
                            })));
                        }else{
                            resolve(p);
                        }
                    }else{
                        resolve(void 0);
                    }
                }
            });
        });
    }

    public addHandler(ext: string, func: (path: string)=>any): void{
        ext = ext[0]==='.' ? ext : '.'+ext;
        this.extTable[ext] = func;
    }
}

function nisFinite(n: any): boolean{
    return (Number as any).isFinite(n);
}
