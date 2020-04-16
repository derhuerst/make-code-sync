'use strict'

const findIdentifiers = require('javascript-idents').all

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
		while (identifiers.includes(id)) id = '_' + randomString()

		identifiers.push(id)
		return id
	}
}

const isNamedCallExpression = (node) =>
	node.type === 'CallExpression'
	&& node.callee.type === 'Identifier'

const isPrimitiveExpression = (node) =>
	/Expression$/.test(node.type)
	&& !(/FunctionExpression$/.test(node.type))



const identifier = (name) => ({type: 'Identifier', name})

const literal = (value) => ({type: 'Literal', value, raw: value + ''})

const declaration = (ids, kind = 'let') => ({
	type: 'VariableDeclaration', kind,
	declarations: ids.map((id) => ({
		type: 'VariableDeclarator', id, init: null
	}))
})

const expressionStatement = (expression) => ({
	type: 'ExpressionStatement', expression
})

const assignment = (left, right, operator = '=') => ({
	type: 'AssignmentExpression',
	left, right, operator
})

const sequence = (...expressions) => ({
	type: 'SequenceExpression', expressions
})

const call = (id, args) => ({
	type: 'CallExpression',
	callee: id, arguments: args
})

const array = (elements) => ({
	type: 'ArrayExpression', elements
})

const object = (props) => ({
	type: 'ObjectExpression',
	properties: Object.entries(props).map(([key, value]) => ({
		type: 'Property', key: identifier(key), value,
		method: false, computed: false, shorthand: false, kind: 'init'
	}))
})



module.exports = {
	unusedName,

	isNamedCallExpression,
	isPrimitiveExpression,

	identifier,
	literal,
	declaration,
	expressionStatement,
	assignment,
	sequence,
	call,
	array,
	object
}
