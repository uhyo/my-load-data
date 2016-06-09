///<reference path='../../typings/bundle.d.ts'/>

// YAML file loader.
import {Promise} from 'es6-promise';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export default function yamlLoader(path: string): Promise<any>{
    return new Promise((resolve, reject)=>{
        fs.readFile(path, {
            encoding: 'utf8',
        }, (err, data)=>{
            if (err != null){
                reject(err);
                return;
            }
            try {
                resolve(yaml.safeLoad(data));
            }catch (e){
                reject(e);
            }
        });
    });
}


