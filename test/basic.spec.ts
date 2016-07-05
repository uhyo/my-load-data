///<reference path="../typings/bundle.d.ts" />

const path = require('path');

const pkg = require('pkg-dir').sync();
const dataDir1 = path.join(pkg, 'test', 'data1');
const dataDir2 = path.join(pkg, 'test', 'data2');
const dataDir3 = path.join(pkg, 'test', 'data3');

import {
    fromDirectory,
    fromFile,
} from '../lib/index';

describe('fromFile', ()=>{
    it('load from json file', (done)=>{
        fromFile(path.join(dataDir1, 'foo.json')).then(obj=>{
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
        fromFile(path.join(dataDir1, 'bar.yaml')).then(obj=>{
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
        fromFile(path.join(dataDir1, 'baz.js')).then(obj=>{
            expect(obj).toEqual({
                java: 'script',
                sum: 10,
                foo: void 0,
            });
            done();
        }).catch(done.fail);
    });
    it('use Promise in js file', (done)=>{
        fromFile(path.join(dataDir2, 'promise.js')).then(obj=>{
            expect(obj).toEqual({
                foo: 'foo',
                bar: 'bar',
            });
            done();
        }).catch(done.fail);
    });
    describe('Error handling', ()=>{
        it('Nonexistent file (json)', (done)=>{
            fromFile(path.join(dataDir2, 'ぴゃああああああ.json')).then(done.fail)
            .catch(err=>{
                expect(err.code).toBe('ENOENT');
                done();
            });
        });
        it('Nonexistent file (js)', (done)=>{
            fromFile(path.join(dataDir2, 'ぴゃああああああ.js')).then(done.fail)
            .catch(err=>{
                expect(err.code).toBe('MODULE_NOT_FOUND');
                done();
            });
        });
        it('Nonexistent directory', (done)=>{
            fromDirectory(path.join(dataDir2, '吉野家')).then(done.fail)
            .catch(err=>{
                expect(err.code).toBe('ENOENT');
                done();
            });
        });
        it('Not directory', (done)=>{
            fromDirectory(path.join(dataDir2, 'promise.js')).then(done.fail)
            .catch(err=>{
                expect(err.code).toBe('ENOTDIR');
                done();
            });
        });
        it('JSON parse error', (done)=>{
            fromFile(path.join(dataDir2, 'broken.json')).then(done.fail)
            .catch(err=>{
                expect(err instanceof Error).toBeTruthy();
                done();
            });
        });
        it('Error thrown from js', (done)=>{
            fromFile(path.join(dataDir2, 'error.js')).then(done.fail)
            .catch(err=>{
                expect(err.message).toBe('foobar');
                done();
            });
        });
    });
});

describe('fromDirectory', ()=>{
    it('load form directory', (done)=>{
        fromDirectory(dataDir1).then(obj=>{
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
    it('Multiple directories', (done)=>{
        fromDirectory([dataDir1, dataDir3]).then(obj=>{
            expect(obj).toEqual({
                foo: {
                    this: 'is from data3/foo.yaml',
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
                hoge: {
                    file: 'hoge.json',
                },
            });
            done();
        }).catch(done.fail);
    });
});
