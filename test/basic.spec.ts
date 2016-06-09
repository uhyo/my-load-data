///<reference path="../typings/bundle.d.ts" />

import * as path from 'path';

const dataDir = path.join(require('pkg-dir').sync(), 'test', 'data');

import {
    fromDirectory,
    fromFile,
} from '../lib/index';

describe('fromFile', ()=>{
    it('load from json file', (done)=>{
        fromFile(path.join(dataDir, 'foo.json')).then(obj=>{
            expect(obj).toEqual({
                bar: 'bar',
                baz: 3,
                arr: [
                    'あいう',
                    3,
                    null,
                ],
            });
            done();
        }).catch(done.fail);
    });
    it('load from yaml file', (done)=>{
        fromFile(path.join(dataDir, 'bar.yaml')).then(obj=>{
            expect(obj).toEqual({
                yaml: 'file',
                foo: {
                    bar: {
                        baz: 10000,
                        hoge: true,
                    },
                },
                n: null,
            });
            done();
        }).catch(done.fail);
    });
    it('load from js file', (done)=>{
        fromFile(path.join(dataDir, 'baz.js')).then(obj=>{
            expect(obj).toEqual({
                java: 'script',
                sum: 10,
                foo: void 0,
            });
            done();
        }).catch(done.fail);
    });
});

describe('fromDirectory', ()=>{
    it('load form directory', (done)=>{
        fromDirectory(dataDir).then(obj=>{
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
            });
            done();
        }).catch(done.fail);
    });
});
