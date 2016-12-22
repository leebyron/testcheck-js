/* @flow */

export { gen } from 'testcheck'
import { Generator, CheckOptions } from 'testcheck'

type Test<T> = (t: T) => void;

export function check<T,A>(
  genA: Generator<A>,
  f: (t: T, a: A) => boolean | void
): Test<T>;
export function check<T,A,B>(
  genA: Generator<A>,
  genB: Generator<B>,
  f: (t: T, a: A, b: B) => boolean | void
): Test<T>;
export function check<T,A,B,C>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  f: (t: T, a: A, b: B, c: C) => boolean | void
): Test<T>;
export function check<T,A,B,C,D>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  f: (t: T, a: A, b: B, c: C, d: D) => boolean | void
): Test<T>;
export function check<T,A,B,C,D,E>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  genE: Generator<E>,
  f: (t: T, a: A, b: B, c: C, d: D, e: E) => boolean | void
): Test<T>;

export function check<T,A>(
  options: CheckOptions,
  genA: Generator<A>,
  f: (t: T, a: A) => boolean | void
): Test<T>;
export function check<T,A,B>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  f: (t: T, a: A, b: B) => boolean | void
): Test<T>;
export function check<T,A,B,C>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  f: (t: T, a: A, b: B, c: C) => boolean | void
): Test<T>;
export function check<T,A,B,C,D>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  f: (t: T, a: A, b: B, c: C, d: D) => boolean | void
): Test<T>;
export function check<T,A,B,C,D,E>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  genE: Generator<E>,
  f: (t: T, a: A, b: B, c: C, d: D, e: E) => boolean | void
): Test<T>;
