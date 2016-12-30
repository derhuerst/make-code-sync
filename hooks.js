#!/usr/bin/env node
'use strict'

const now = (fn, ...args) => {
	if (fn === setTimeout) return
	return fn(...args)
}

const defer = (calls) => {
	calls
	.filter((call) => call.fn === setTimeout)
	.sort((call1, call2) => call1.args[1] - call2.args[1]) // sort by delay
	.forEach(({args}) => args[0]()) // call callback synchronously
}

module.exports = {now, defer}
