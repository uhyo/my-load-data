///<reference path='../../typings/bundle.d.ts'/>

// JSON file loader.
import {Promise} from 'es6-promise';
import * as fs from 'fs';

export default function jsonLoader(path: string): Promise<any>{
    return new Promise((resolve, reject)=>{
        fs.readFile(path, {
            encoding: 'utf8',
        }, (err, data)=>{
            if (err != null){
                reject(err);
                return;
            }
            try {
                resolve(JSON.parse(data));
            }catch (e){
                reject(e);
            }
        });
    });
}
