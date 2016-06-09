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

const defaultExtTable: IExtTable = {
    '.json': jsonLoader,
    '.yaml': yamlLoader,
    '.yml': yamlLoader,
    '.js': jsLoader,
};

export class Loader{
    private extTable: IExtTable = defaultExtTable;

    public fromDirectory(dir: string | Array<string>): Promise<any>{
        const result: any = {};
        if ('string'===typeof dir){
            return this.fromDirectory1(dir as string, result);
        }
    }
    private fromDirectory1(dir: string, target: any): Promise<any>{
        return new Promise((resolve, reject)=>{
            fs.readdir(dir, (err, files)=>{
                if (err != null){
                    reject(err);
                    return;
                }
                const h = (i: number)=>{
                    const f = files[i];
                    if (f == null){
                        return Promise.resolve(target);
                    }
                    const pa = path.join(dir, f);
                    return this.fromFile(pa).then(v=>{
                        if (v !== void 0){
                            target[f] = v;
                        }
                        return h(i+1);
                    });
                };
                resolve(h(0));
            });
        });
    }
    public fromFile(pa: string): Promise<any>{
        return new Promise((resolve, reject)=>{
            fs.stat(pa, (err, st)=>{
                if (err != null){
                    reject(err);
                    return;
                }
                if (st.isDirectory()){
                    // ちょーーーーこれディレクトリなんですけどーーーーーーーーーーー
                    const obj: any = {};
                    resolve(this.fromDirectory1(pa, obj));
                    return;
                }else{
                    const ext = path.extname(pa);
                    const f = this.extTable[ext];
                    if ('function'===typeof f){
                        resolve(f(pa));
                    }else{
                        resolve(void 0);
                    }
                }
            });
        });
    }
}
