const { install } = require('../jasmine-check')

describe('jasmine-check', () => {
  let registeredSpec
  let specResult
  let spec

  beforeEach(() => {
    spec = {
      addMatcherResult: (result) => {
        specResult = result
      },
      result: {}
    }
  })

   
  let env = {
    jasmine: {
      getEnv: () => ({ version: () => 2 })
    },
    expect: (expected) => ({
      toBe: (actual) => spec.addMatcherResult({ 
        expected,
        actual,
        passed: () => expected === actual
      })
    }),
    it: (desc, run) => {
      spec.description = desc
      registeredSpec = { desc, run }
      return spec
    } 
  }
  const runSpec = () => {
    spec.result.fullName = registeredSpec.desc
    spec.result.description = registeredSpec.desc
    registeredSpec.run()
    return spec
  }

  it('runs a passing test', () => {
    install(env)

    env.check.it('a passing test', env.gen.int, (x) => {
      env.expect(x).toBe(x)
    })

    let result = runSpec()
    
    expect(specResult.passed()).toBe(true)
  })

  it('runs a failing test', () => {
    install(env)

    env.check.it('a failing test', env.gen.int, (x) => {
      env.expect(x).toBe('foo')
    })

    let spec = runSpec()
    
    expect(specResult.passed()).toBe(false)
    const resultRe = new RegExp('a failing test \\( \\u001b\\[33m0\\u001b\\[39m \\) Seed: \\u001b\\[33m\\d+\\u001b\\[39m ')
    expect(spec.description).toMatch(resultRe)
    expect(spec.result.description).toMatch(resultRe)
    expect(spec.result.fullName).toMatch(resultRe)
  })
})