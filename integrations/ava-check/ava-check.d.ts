/* @flow */

export { gen } from 'testcheck'
import { ValueGenerator, CheckOptions } from 'testcheck'
import { ContextualTest, TestContext } from 'ava'

export function check<T,A>(
  genA: ValueGenerator<A>,
  f: (t: TestContext, a: A) => boolean | void
): ContextualTest;
export function check<T,A,B>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  f: (t: TestContext, a: A, b: B) => boolean | void
): ContextualTest;
export function check<T,A,B,C>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  f: (t: TestContext, a: A, b: B, c: C) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  f: (t: TestContext, a: A, b: B, c: C, d: D) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D,E>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  genE: ValueGenerator<E>,
  f: (t: TestContext, a: A, b: B, c: C, d: D, e: E) => boolean | void
): ContextualTest;

export function check<T,A>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  f: (t: TestContext, a: A) => boolean | void
): ContextualTest;
export function check<T,A,B>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  f: (t: TestContext, a: A, b: B) => boolean | void
): ContextualTest;
export function check<T,A,B,C>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  f: (t: TestContext, a: A, b: B, c: C) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  f: (t: TestContext, a: A, b: B, c: C, d: D) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D,E>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  genE: ValueGenerator<E>,
  f: (t: TestContext, a: A, b: B, c: C, d: D, e: E) => boolean | void
): ContextualTest;
