///<reference path="../typings/bundle.d.ts" />

import * as path from 'path';

const pkg = require('pkg-dir').sync();
const dataDir1 = path.join(pkg, 'test', 'data1');
const dataDir2 = path.join(pkg, 'test', 'data2');

import {
    Loader,
} from '../lib/index';

describe('Loader', ()=>{
    describe('basic loader usage', ()=>{
        let loader: Loader;
        beforeEach(()=>{
            loader = new Loader();
        });
        it('fromDirectory', (done)=>{
            loader.fromDirectory(dataDir1).then(obj=>{
                expect(obj).toEqual({
                    foo: {
                        bar: 'bar',
                        baz: 3,
                        arr: [
                            'あいう',
                            3,
                            null,
                        ],
                    },
                    bar: {
                        yaml: 'file',
                        foo: {
                            bar: {
                                baz: 10000,
                                hoge: true,
                            },
                        },
                        n: null,
                    },
                    baz: {
                        java: 'script',
                        sum: 10,
                        foo: void 0,
                    },
                    sub: {
                        file: 'Hi',
                    },
                });
                done();
            }).catch(done.fail);
        });
        it('addHandler (with filetype)', (done)=>{
            loader.addHandler('json', (path)=> ({
                foo: 'barbarbarbarbababababa',
            }));
            loader.fromFile(path.join(dataDir1, 'foo.json')).then(obj=>{
                expect(obj).toEqual({
                    foo: 'barbarbarbarbababababa',
                });
                done();
            }).catch(done.fail);
        });
        it('addHandler (with ext)', (done)=>{
            loader.addHandler('.yaml', (path)=> 'I am YAML documentooooooooo');
            loader.fromFile(path.join(dataDir1, 'bar.yaml')).then(obj=>{
                expect(obj).toBe('I am YAML documentooooooooo');
                done();
            }).catch(done.fail);
        });
    });
});

