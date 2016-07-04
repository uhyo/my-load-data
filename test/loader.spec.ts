///<reference path="../typings/bundle.d.ts" />

import * as path from 'path';
import * as fs from 'fs';

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
    describe('mtime option', ()=>{
        let loader: Loader;
        beforeEach(()=>{
            loader = new Loader();
        });
        it('fromFile', done=>{
            const f = path.join(dataDir1, 'foo.json');
            loader.fromFile(f, {
                mtime: true,
            }).then(obj=>{
                const mtime = fs.statSync(f).mtime.getTime();
                expect(obj).toEqual({
                    bar: 'bar',
                    baz: 3,
                    arr: [
                        'あいう',
                        3,
                        null,
                    ],
                    '$mtime': mtime,
                });
                done();
            }).catch(done.fail);
        });
        it('fromFile with mtime field option', done=>{
            const f = path.join(dataDir1, 'bar.yaml');
            const mtimef = 'MTIMEEEEEE';
            loader.fromFile(f, {
                mtime: mtimef,
            }).then(obj=>{
                const mtime = fs.statSync(f).mtime.getTime();
                expect(obj).toEqual({
                    yaml: 'file',
                    foo: {
                        bar: {
                            baz: 10000,
                            hoge: true,
                        },
                    },
                    n: null,
                    [mtimef]: mtime,
                });
                done();
            }).catch(done.fail);
        });
        it('fromDirectory', (done)=>{
            loader.fromDirectory(dataDir1, {
                mtime: true,
            }).then(obj=>{
                expect(obj).toEqual({
                    foo: {
                        bar: 'bar',
                        baz: 3,
                        arr: [
                            'あいう',
                            3,
                            null,
                        ],
                        '$mtime': fMtime(path.join(dataDir1, 'foo.json')),
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
                        '$mtime': fMtime(path.join(dataDir1, 'bar.yaml')),
                    },
                    baz: {
                        java: 'script',
                        sum: 10,
                        foo: void 0,
                        '$mtime': fMtime(path.join(dataDir1, 'baz.js')),
                    },
                    sub: {
                        file: 'Hi',
                        '$mtime': fMtime(path.join(dataDir1, 'sub')),
                    },
                    '$mtime': fMtime(dataDir1),
                });
                done();
            }).catch(done.fail);
        });
    });
});

// ディレクトリの場合は一番新しいmtimeを求める関数 (syncで)
function fMtime(f: string): number{
    const st = fs.statSync(f);
    if (st.isDirectory()){
        const files = fs.readdirSync(f);
        let mtime = -Infinity;
        for (let fi of files){
            const mt = fMtime(path.join(f, fi));
            if (mtime < mt){
                mtime = mt;
            }
        }
        return mtime;
    }else{
        return st.mtime.getTime();
    }
}
