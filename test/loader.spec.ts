///<reference path="../typings/bundle.d.ts" />

import * as path from 'path';
import * as fs from 'fs';

const mock = require('mock-fs');

const pkg = require('pkg-dir').sync();
const dataDir1 = path.join(pkg, 'test', 'data1');
const dataDir2 = path.join(pkg, 'test', 'data2');

import {
    Loader,
} from '../lib/index';

describe('Loader', ()=>{
    let loader: Loader;
    beforeEach(()=>{
        loader = new Loader();
    });
    describe('basic loader usage', ()=>{
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
    describe('cache option', ()=>{
        const mtime = new Date();
        beforeEach(()=>{
            mock({
                '/data': {
                    'foo.json': mock.file({
                        content: `{
    "this":"is mock file",
    "that":"is my cat"
}`,
                        mtime,
                    }),
                    'bar.yaml': mock.file({
                        content: `cat:
  name: 三毛猫
  hp: 300
  attack: 50
`,
                        mtime: new Date(mtime.getTime()-7200000),
                    }),
                },
            });
        });
        afterEach(()=>{
            mock.restore();
        });
        describe('cache: true is the same as mtime: true', ()=>{
            it('fromFile', done=>{
                const f = '/data/foo.json';
                loader.fromFile(f, {
                    cache: true,
                }).then(obj=>{
                    expect(obj).toEqual({
                        'this': 'is mock file',
                        'that': 'is my cat',
                        '$mtime': mtime.getTime(),
                    });
                    done();
                }).catch(done.fail);
            });
            it('fromDirectory', done=>{
                const f = '/data/';
                loader.fromDirectory(f, {
                    cache: true,
                }).then(obj=>{
                    expect(obj).toEqual({
                        foo: {
                            'this': 'is mock file',
                            'that': 'is my cat',
                            '$mtime': mtime.getTime(),
                        },
                        bar: {
                            cat: {
                                name: '三毛猫',
                                hp: 300,
                                attack: 50,
                            },
                            '$mtime': mtime.getTime()-7200000,
                        },
                        '$mtime': mtime.getTime(),
                    });
                    done();
                }).catch(done.fail);
            });
        });
        describe('use cache to ignore older files', ()=>{
            it('fromFile (newer)', done=>{
                const f = '/data/foo.json';
                const cache = {
                    'this': 'is from cache',
                    // 昔のファイル
                    '$mtime': mtime.getTime()-3600000,
                };
                loader.fromFile(f, {
                    cache,
                }).then(obj=>{
                    expect(obj).toEqual({
                        'this': 'is mock file',
                        'that': 'is my cat',
                        '$mtime': mtime.getTime(),
                    });
                    done();
                }).catch(done.fail);
            });
            it('fromFile (older)', done=>{
                const f = '/data/foo.json';
                const cache = {
                    'this': 'is from cache',
                    // 未来からきたcache
                    '$mtime': mtime.getTime()+3600000,
                };
                loader.fromFile(f, {
                    cache,
                }).then(obj=>{
                    expect(obj).toEqual({
                        'this': 'is from cache',
                        '$mtime': mtime.getTime()+3600000,
                    });
                    done();
                }).catch(done.fail);
            });
            it('fromDirectory', done=>{
                const f = '/data';
                const cache = {
                    foo: {
                        'this cache': 'is too old',
                        '$mtime': mtime.getTime()-3600000,
                    },
                    bar: {
                        'this': 'is from cache',
                        '$mtime': mtime.getTime()+60000,
                    },
                    '$mtime': mtime.getTime(),
                };
                loader.fromDirectory(f, {
                    cache,
                }).then(obj=>{
                    expect(obj).toEqual({
                        foo: {
                            'this': 'is mock file',
                            'that': 'is my cat',
                            '$mtime': mtime.getTime(),
                        },
                        bar: {
                            'this': 'is from cache',
                            '$mtime': mtime.getTime()+60000,
                        },
                        '$mtime': mtime.getTime()+60000,
                    });
                    done();
                }).catch(done.fail);
            });
            it('only in cache', done=>{
                const f = '/data';
                const cache = {
                    foo: {
                        'this cache': 'is too old',
                        '$mtime': mtime.getTime()-3600000,
                    },
                    baz: {
                        'this': 'is deleted in the file system',
                        '$mtime': mtime.getTime()-7200000,
                    },
                    '$mtime': mtime.getTime()-3600000,
                };
                loader.fromDirectory(f, {
                    cache,
                }).then(obj=>{
                    expect(obj).toEqual({
                        foo: {
                            'this': 'is mock file',
                            'that': 'is my cat',
                            '$mtime': mtime.getTime(),
                        },
                        bar: {
                            cat: {
                                name: '三毛猫',
                                hp: 300,
                                attack: 50,
                            },
                            '$mtime': mtime.getTime()-7200000,
                        },
                        '$mtime': mtime.getTime(),
                    });
                    done();
                }).catch(done.fail);
            });
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
