'use strict'

const findIdentifiers = require('javascript-idents').all
const walk = require('estraverse').replace

const _ = require('./ast-helpers')



const randomString = (l = 3) => {
	let id = (Math.random() * 26 + 10 | 0).toString(36)
	for (let i = 1; i < l; i++)
		id += (Math.random() * 26 | 0).toString(36)
	return id
}

const unusedName = (ast) => {
	const identifiers = findIdentifiers(ast)
	return () => {
		let id = '_' + randomString()
		while (identifiers.includes(id))
			id = '_' + randomString()
		identifiers.push(id)
		return id
	}
}



const defaults = {
	unusedName,
	nameOfNow: null,
	nameOfDefer: null
}

const instrument = (ast, opt = {}) => {
	opt = Object.assign({}, defaults, opt)

	const newName = opt.unusedName(ast)

	const allAnchors = []
	const addAnchor = (name) => allAnchors.push(_.identifier(name))
	const allCalls = []
	const addCall = (fn, args) => allCalls.push({fn, args})

	// todo: would this be a use case for Symbols?
	const nameOfNow = opt.nameOfNow || newName()
	const nameOfDefer = opt.nameOfDefer || newName()



	ast = walk(ast, {
		enter: (n) => {},
		leave: (n) => {

			if (_.isNamedCallExpression(n)) {
				// generate hook names
				const fnName = newName()
				addAnchor(fnName)
				const argNames = n.arguments.map(newName)
				argNames.forEach(addAnchor)

				// generate hook assignments
				const fn = _.assignment(_.identifier(fnName), n.callee)
				const args = n.arguments.map((arg, i) => {
					const argName = _.identifier(argNames[i])
					return _.assignment(argName, arg)
				})

				// call to `now` fn
				const now = _.call(_.identifier(nameOfNow), [
					_.identifier(fnName)
				].concat(argNames.map(_.identifier)))
				allCalls.push({fn: fnName, args: argNames})

				// replace original call by hook declarations & call to `now` fn
				n = _.sequence(fn, ...args, now)
			}

			else if (n.type === 'Program') {
				let body = n.body

				// prepend anchor declarations
				if (allAnchors.length > 0)
					body = [].concat(_.declaration(allAnchors), body)

				// append call to `defer`
				if (allCalls.length > 0) {
					const data = _.array(allCalls.map((call) =>
						_.object({
							fn: _.identifier(call.fn),
							args: _.array(call.args.map(_.identifier))
						})
					))
					body = body.concat(
						_.expressionStatement(_.call(_.identifier(nameOfDefer), [data]))
					)
				}

				n = Object.assign({}, n, {body}) // replace Program node
			}

			return n
		}
	})

	return {ast, nameOfNow, nameOfDefer}
}

module.exports = instrument
