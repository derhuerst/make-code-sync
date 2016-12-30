#!/usr/bin/env node
'use strict'

const parse = require('acorn').parse
const generate = require('escodegen').generate
const vm = require('vm')
const test = require('tape')

const syncify = require('.')
const {now, defer} = require('./hooks')



const run = (code, variable) => {
	const ast = parse(code, {ecmaVersion: 6})
	const sync = syncify(ast)

	return vm.runInNewContext(generate(sync.ast) + '\n;' + variable, {
		setTimeout,
		[sync.nameOfNow]: now,
		[sync.nameOfDefer]: defer
	})
}



test('fails on reference error', (t) => {
	t.plan(1)

	try {
		run(`const x = a + 1`, 'x')
		t.fail('didnt throw a ReferenceError')
	} catch (err) {
		t.equal(err.name, 'ReferenceError', 'invalid error')
	}
})

test('inlines `setTimeout`', (t) => {
	t.plan(1)
	const x = run(`
		let x = 2;
		setTimeout(() => {
			x += 1;
		}, 100)
		x = 0
	`, 'x')

	t.equal(x, 1, 'setTimeout not executed')
})

test('sorts `setTimeout` calls', (t) => {
	t.plan(1)
	const x = run(`
		let x = 1;
		setTimeout(() => {
			x = 0;
		}, 200)
		setTimeout(() => {
			x += 1;
		}, 100)
	`, 'x')

	t.equal(x, 0, '200ms timeout not executed last')
})
