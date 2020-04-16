# make-code-sync

**Makes common async calls like `setTimout` sync.**

[![npm version](https://img.shields.io/npm/v/make-code-sync.svg)](https://www.npmjs.com/package/make-code-sync)
[![build status](https://api.travis-ci.org/derhuerst/make-code-sync.svg?branch=master)](https://travis-ci.org/derhuerst/make-code-sync)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/make-code-sync.svg)
![minimum Node.js version](https://img.shields.io/node/v/make-code-sync.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)

This module takes an [abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and transforms it so that all calls to e.g. `setTimeout` will be executed synchronously.

If your code does not use any other async funtions like [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), it will be easy to do analyses on it or run it using [`vm.runInNewContext`](https://nodejs.org/docs/latest-v10.x/api/vm.html#vm_vm_runinnewcontext_code_sandbox_options).

## Caveats

- Right now only `setTimeout` works, but I plan to support `setImmediate` as well `setInterval`.
- The `setTimeout` mock is not spec-compatible. Actually, it is quite lacking.


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
