// Note: importing tape assumes you have installed @types/tape
import * as tape from 'tape';

export { gen } from 'testcheck';
import { Generator, CheckOptions } from 'testcheck';

type Test = (t: tape.Test) => void;

export function check<A>(
  genA: Generator<A>,
  f: (t: tape.Test, a: A) => void
): Test;
export function check<A,B>(
  genA: Generator<A>,
  genB: Generator<B>,
  f: (t: tape.Test, a: A, b: B) => void
): Test;
export function check<A,B,C>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  f: (t: tape.Test, a: A, b: B, c: C) => void
): Test;
export function check<A,B,C,D>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D) => void
): Test;
export function check<A,B,C,D,E>(
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  genE: Generator<E>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D, e: E) => void
): Test;

export function check<A>(
  options: CheckOptions,
  genA: Generator<A>,
  f: (t: tape.Test, a: A) => void
): Test;
export function check<A,B>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  f: (t: tape.Test, a: A, b: B) => void
): Test;
export function check<A,B,C>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  f: (t: tape.Test, a: A, b: B, c: C) => void
): Test;
export function check<A,B,C,D>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D) => void
): Test;
export function check<A,B,C,D,E>(
  options: CheckOptions,
  genA: Generator<A>,
  genB: Generator<B>,
  genC: Generator<C>,
  genD: Generator<D>,
  genE: Generator<E>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D, e: E) => void
): Test;
