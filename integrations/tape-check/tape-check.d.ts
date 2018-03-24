// Note: importing tape assumes you have installed @types/tape
import * as tape from 'tape';

export { gen } from 'testcheck';
import { ValueGenerator, CheckOptions } from 'testcheck';

type Test = (t: tape.Test) => void;

export function check<A>(
  genA: ValueGenerator<A>,
  f: (t: tape.Test, a: A) => void
): Test;
export function check<A,B>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  f: (t: tape.Test, a: A, b: B) => void
): Test;
export function check<A,B,C>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  f: (t: tape.Test, a: A, b: B, c: C) => void
): Test;
export function check<A,B,C,D>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D) => void
): Test;
export function check<A,B,C,D,E>(
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  genE: ValueGenerator<E>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D, e: E) => void
): Test;

export function check<A>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  f: (t: tape.Test, a: A) => void
): Test;
export function check<A,B>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  f: (t: tape.Test, a: A, b: B) => void
): Test;
export function check<A,B,C>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  f: (t: tape.Test, a: A, b: B, c: C) => void
): Test;
export function check<A,B,C,D>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D) => void
): Test;
export function check<A,B,C,D,E>(
  options: CheckOptions,
  genA: ValueGenerator<A>,
  genB: ValueGenerator<B>,
  genC: ValueGenerator<C>,
  genD: ValueGenerator<D>,
  genE: ValueGenerator<E>,
  f: (t: tape.Test, a: A, b: B, c: C, d: D, e: E) => void
): Test;
