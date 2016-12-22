/* @flow */

export { gen } from 'testcheck'
import { Generator, CheckOptions } from 'testcheck'
import { ContextualTest, ContextualTestContext } from 'ava'

export function check<T,A>(
  genA: Generator<A>,
  f: (t: ContextualTestContext, a: A) => boolean | void
): ContextualTest;
export function check<T,A,B>(
  genA: Generator<A>,
  genB: Generator<B>,
  f: (t: ContextualTestContext, a: A, b: B) => boolean | void
): ContextualTest;
export function check<T,A,B,C>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  f: (t: ContextualTestContext, a: A, b: B, c: C) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  f: (t: ContextualTestContext, a: A, b: B, c: C, d: D) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D,E>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  genE: Generator<E>,
  f: (t: ContextualTestContext, a: A, b: B, c: C, d: D, e: E) => boolean | void
): ContextualTest;

export function check<T,A>(
  options: CheckOptions,
  genA: Generator<A>,
  f: (t: ContextualTestContext, a: A) => boolean | void
): ContextualTest;
export function check<T,A,B>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  f: (t: ContextualTestContext, a: A, b: B) => boolean | void
): ContextualTest;
export function check<T,A,B,C>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  f: (t: ContextualTestContext, a: A, b: B, c: C) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  f: (t: ContextualTestContext, a: A, b: B, c: C, d: D) => boolean | void
): ContextualTest;
export function check<T,A,B,C,D,E>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  genE: Generator<E>,
  f: (t: ContextualTestContext, a: A, b: B, c: C, d: D, e: E) => boolean | void
): ContextualTest;
