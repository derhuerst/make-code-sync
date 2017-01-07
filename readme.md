# make-code-sync

**Makes common async calls like `setTimout` sync.**

This module takes an [abstract syntax tree (AST)](todo) and transforms it so that all calls to e.g. `setTimeout` will be executed synchronously.

If your code does not use any other async funtions like [`fetch`](todo), it will be easy to do analyses on it or run it using [`vm.runInNewContext`](todo).

## Caveats

- Right now only `setTimeout` works, but I plan to support `setImmediate` as well `setInterval`.
- The `setTimeout` mock is not spec-compatible. Actually, it is quite lacking.

[![npm version](https://img.shields.io/npm/v/make-code-sync.svg)](https://www.npmjs.com/package/make-code-sync)
[![build status](https://img.shields.io/travis/derhuerst/make-code-sync.svg)](https://travis-ci.org/derhuerst/make-code-sync)
[![dependency status](https://img.shields.io/david/derhuerst/make-code-sync.svg)](https://david-dm.org/derhuerst/make-code-sync)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/make-code-sync.svg)](https://david-dm.org/derhuerst/make-code-sync#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/make-code-sync.svg)


## Installing

```shell
npm install make-code-sync
```


## Usage

```js
const parse = require('acorn').parse
const generate = require('escodegen').generate
const vm = require('vm')
const assert = require('assert')

const syncify = require('.')
// `now` filters out all calls to `setTimeout`.
// `defer`, running in the end, executes all `setTimeout` callbacks, ordered by delay.
const {now, defer} = require('./hooks')

const code = `
	let x = 2
	setTimeout(() => {
		x += 1
	}, 100)
	x = 0
`

const parsed = parse(code, {ecmaVersion: 6})
const sync = syncify(parsed)
const transformed = generate(sync.ast)
	+ '\nx' // to get the value of `x`s
const ctx = {setTimeout, [sync.nameOfNow]: now, [sync.nameOfDefer]: defer}

assert.strictEqual(vm.runInNewContext(transformed, ctx), 1)
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/make-code-sync/issues).
