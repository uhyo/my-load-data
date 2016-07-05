///<reference path='../typings/bundle.d.ts'/>

import {
    Loader,
    IOption,
} from './loader';

// make default loader.
const dl = new Loader();

function fromDirectory(dir: string | Array<string>, options?: IOption): Promise<any>{
    return dl.fromDirectory(dir, options);
}
function fromFile(path: string, options?: IOption): Promise<any>{
    return dl.fromFile(path, options);
}

export {
    Loader,
    fromDirectory,
    fromFile,
};

