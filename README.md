# my-load-data
This is my module that loads files of a few format including JSON, YAML and plain JS for me.

## installation
```sh
 $ npm install my-load-data
```

## Examples

### Basic usage
```js
const mld = require('my-load-data');

// mld.fromFile() returns Promise
mld.fromFile('./data/foo.json').then(obj=>console.log(obj))
.catch(err=>console.error(err));

// It can also load all files in a directory
mld.fromDirectory('./data').then(obj=>console.log(obj))
.catch(err=>console.error(err));
/*
If ./data contains foo.json, bar.yaml and baz.js:

{
    "foo": {...},
    "bar": {...},
    "baz": {...},
}
*/

// Array of paths is accepted
mld.fromDirectory(['./data', './data1']).then(obj=>console.log(obj));
```

### Loader
You can instantiate `Loader`s instead of using the default Loader. `Loader`s can be customized through `addHandler` (see API below).

```js
const mld = require('my-load-data');

const loader = new mld.Loader();

loader.fromFile('./data/foo.json').then(obj=>console.log(obj));
```

## API

### mld.fromFile(path[, options]) / loader.fromFile(path[, options])
- **Return value**: Promise&lt;any&gt;
- **path**: string; Path to the file to load data from.
- **options**:
  - **mtime**: boolean | string; If the value is truthy, mtime of the file is added to the result object. If the value is string, it is used as the field name. The default field name is `$mtime`.
  - **cache**: Object; If this option is used, unchanged files (determined by mtime) is not loaded and its value is taken from cache. The cache should be the return value of previous call to fromFile with mtime enabled (When cache is used, mtime is automatically enabled).
  - **nocacheFilter**: RegExp | Function; Filter function to temporally disable cache based on file names. If the function returns true, the file is newly loaded regardless of its time. 

### mld.fromDirectory(path[, options]) / loader.fromDirectory(path[, options])
- **Return value**: Promise&lt;any&gt;
- **path**: string | Array<string>; Path to the directory to load data from.
- **options**: See above.

If `path` is an Array, directories are visited sequentially. 

### loader.addHandler(ext, handler)
- **ext**: string; Name of extension to add handler.
- **handler**: (path: string)=&gt;any;

Use this method to add a custom handler. `handler` is passed an absolute path of a file to load: `path`.

As shown in the example below, return value of `handler` is treated as a result of loading. `handle` also can return Promise for asynchronous operations.

#### example
```js
const fs = require('fs');
const mld = require('my-load-data');

// add a handler to load .txt file as string.
mld.addHandler('txt', path=> fs.readFileSync(path, 'utf8'));

// Now mld can load .txt file
mld.fromFile('data/hoge.txt').then(str=>console.log(str));

// fromDirectory now finds and handles .txt files
mld.fromDirectory('data').then(obj=>console.log(obj.hoge));
```

## Gimmicks
- **json** file is loaded using `JSON.parse`.
- **yaml** file is loaded using [js-yaml](https://www.npmjs.com/package/js-yaml). This module uses `safeLoad`. To customize this behavior, add a custom handler using `addHandler`.
- **js** file is loaded using `require`. js files can export Promises to make an asynchronous operation.

## Changelog
- **v1.1.0** (2017-06-02) Add the `mtime`, `cache` and `nocacheFilter` option for me.
- **v1.0.0** (2016-06-10)

## License
MIT

## Contribution
Following npm scripts are useful:

- `npm build`: build source files into `dist/`.
- `npm watch`: watch changes in `lib/` and `test/`; on changes, compiling, linting and testing are triggered.
- `npm clean`: removes `dist/` directory.
