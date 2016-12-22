/* @flow */

const test = require('ava');
const { gen, check } = require('../');

test('generates', check(gen.int, gen.string, (t, x, y) => {
  t.is(typeof x, 'number')
  t.is(typeof y, 'string')
}))

test('supports returning a boolean', check(gen.int, (t, x) =>
  t.is(typeof x, 'number')
))

test('generates with options', check({ numTests: 10 }, gen.posInt, (t, x) => {
  t.true(x >= 0)
}))
