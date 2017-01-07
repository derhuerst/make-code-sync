'use strict'

const parse = require('acorn').parse
const generate = require('escodegen').generate
const vm = require('vm')
const assert = require('assert')

const syncify = require('.')
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
