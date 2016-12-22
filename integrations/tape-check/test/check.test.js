/* @flow */

const test = require('tape')
const { check, gen } = require('../')

test('generates', check(gen.int, gen.string, (t, x, y) => {
  t.plan(2)
  t.is(typeof x, 'number')
  t.is(typeof y, 'string')
}))

test('generates with options', check({ numTests: 10 }, gen.posInt, (t, x) => {
  t.true(x >= 0)
  t.end()
}))
