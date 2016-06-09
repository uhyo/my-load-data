///<reference path='../../typings/bundle.d.ts'/>

// JS file loader.
import {Promise} from 'es6-promise';

export default function jsLoader(path: string): Promise<any>{
    try {
        return Promise.resolve(require(path));
    }catch (e){
        return Promise.reject(e);
    }
}

