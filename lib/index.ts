///<reference path='../typings/bundle.d.ts'/>

import {Loader} from './loader';

// make default loader.
const dl = new Loader();

function fromDirectory(dir: string | Array<string>): Promise<any>{
    return dl.fromDirectory(dir);
}
function fromFile(path: string): Promise<any>{
    return dl.fromFile(path);
}

export {
    Loader,
    fromDirectory,
    fromFile,
};

