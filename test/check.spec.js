// @flow

const test = require('ava');
const { check, property, gen } = require('../')

test('checks true properties', t => {
  const seedVal = 1234567890
  let calls = 0

  const result = check(property(
    gen.posInt,
    function (intValue) {
      calls++
      return intValue >= 0
    }
  ), { numTests: 100, seed: seedVal })

  t.true(calls === 100)
  t.true(result.result === true)
  t.true(result.numTests === 100)
  t.true(result.seed === seedVal)
})

test('checks false properties', t => {
  const seedVal = 1234567890
  let calls = 0

  const result = check(property(
    gen.posInt,
    function (intValue) {
      calls++
      return intValue >= 0 && intValue < 42
    }
  ), { numTests: 100, seed: seedVal })

  t.true(calls < 100)
  const shrunk = result.shrunk
  const fail = result.fail
  t.true(typeof shrunk === 'object')
  t.true(Array.isArray(fail))
  if (shrunk != null && fail != null) { // flow
    t.true(calls === result.numTests + shrunk.totalNodesVisited)
    t.true(result.result === false)
    t.true(fail.length === 1)
    t.deepEqual(shrunk.smallest, [ 42 ])
  }
})

test('accepts multiple generators as arguments', t => {
  let calls = 0

  const result = check(property(
    gen.posInt, gen.string,
    function (intValue, string) {
      calls++
      return intValue >= 0 && typeof string === 'string'
    }
  ))

  t.true(calls === 100)
  t.true(result.fail === undefined)
  t.true(result.result === true)
  t.true(result.numTests === 100)
})

test('tests properties that throw', t => {
  const result = check(property(
    gen.int,
    function (intValue) {
      if (intValue < -10) {
        throw new Error('Expected ' + intValue + ' to be at least -10')
      }
    }
  ))

  t.true(typeof result.shrunk === 'object')
  t.true(Array.isArray(result.fail))
  t.true(result.result instanceof Error)

  const shrunk = result.shrunk
  if (shrunk && shrunk.result instanceof Error) { // flow
    t.true(shrunk.result.message === 'Expected -11 to be at least -10')
    t.deepEqual(shrunk.smallest, [ -11 ])
  }
})

test('tests properties that throw and pass', t => {
  const result = check(property(
    gen.posInt,
    function (intValue) {
      if (intValue < 0) {
        throw new Error('Expected ' + intValue + ' to be at least 0')
      }
    }
  ))

  t.true(result.fail === undefined)
  t.true(result.result === true)
})

test('accepts deprecated options', t => {
  let calls = 0

  // $ExpectError
  const result = check(property(gen.int, () => true), { times: 100 })

  t.true(result.numTests === 100)
})

test('supports deprecated array properties', t => {
  let calls = 0

  // $ExpectError
  const result = check(property(
    [gen.posInt, gen.string],
    function (intValue, string) {
      calls++
      return intValue >= 0 && typeof string === 'string'
    }
  ), { times: 100 })

  t.true(calls === 100)
  t.true(result.result === true)
  t.true(result.numTests === 100)
})
