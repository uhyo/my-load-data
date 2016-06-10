# my-load-data
This is my module that loads files of a few format including JSON, YAML and plain JS.

## installation
```sh
 $ npm install my-load-data
```

This module provides TypeScript support. TypeScript will automatically find typing information for this module.

## Examples
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

## API

### mld.fromFile(path)
- **Return value**: Promise&lt;any&gt;
- **path**: string; Path to the file to load data from.

### mld.fromDirectory(path)
- **Return value**: Promise&lt;any&gt;
- **path**: string | Array<string>; Path to the directory to load data from.

If `path` is an Array, directories are visited sequentially. 

### mld.addHandler(ext, handler)
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
- **v1.0.0**

## License
MIT

## Contribution
Following npm script is useful:

- `npm build`: build source files into `dist/`.
- `npm watch`: watch changes in `lib/` and `test/`; on changes, compiling, linting and testing are triggered.
- `npm clean`: removes `dist/` directory.