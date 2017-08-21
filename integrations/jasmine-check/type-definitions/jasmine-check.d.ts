import { Generator, CheckOptions } from 'testcheck';

declare global {
  type Check<Key extends string> = {
    [checker in Key]: {
      (description: string, opts?: CheckOptions): void;
      (description: string, fn: () => void): void;
      (description: string, opts: CheckOptions, fn: () => void): void;
      <A>(description: string, genA: Generator<A>, fn: (a: A) => void): void;
      <A>(description: string, opts: CheckOptions, genA: Generator<A>, fn: (a: A) => void): void;
      <A, B>(description: string, genA: Generator<A>, genB: Generator<B>, fn: (a: A, b: B) => void): void;
      <A, B>(
        description: string,
        opts: CheckOptions,
        genA: Generator<A>,
        genB: Generator<B>,
        fn: (a: A, b: B) => void,
      ): void;
      <A, B, C>(
        description: string,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        fn: (a: A, b: B, c: C) => void,
      ): void;
      <A, B, C>(
        description: string,
        opts: CheckOptions,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        fn: (a: A, b: B, c: C) => void,
      ): void;
      <A, B, C, D>(
        description: string,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        fn: (a: A, b: B, c: C, d: D) => void,
      ): void;
      <A, B, C, D>(
        description: string,
        opts: CheckOptions,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        fn: (a: A, b: B, c: C, d: D) => void,
      ): void;
      <A, B, C, D, E>(
        description: string,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        fn: (a: A, b: B, c: C, d: D, e: E) => void,
      ): void;
      <A, B, C, D, E>(
        description: string,
        opts: CheckOptions,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        fn: (a: A, b: B, c: C, d: D, e: E) => void,
      ): void;
      <A, B, C, D, E, F>(
        description: string,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        genF: Generator<F>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F) => void,
      ): void;
      <A, B, C, D, E, F>(
        description: string,
        opts: CheckOptions,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        genF: Generator<F>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F) => void,
      ): void;
      <A, B, C, D, E, F, G>(
        description: string,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        genF: Generator<F>,
        genG: Generator<G>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => void,
      ): void;
      <A, B, C, D, E, F, G>(
        description: string,
        opts: CheckOptions,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        genF: Generator<F>,
        genG: Generator<G>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => void,
      ): void;
      <A, B, C, D, E, F, G, H>(
        description: string,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        genF: Generator<F>,
        genG: Generator<G>,
        genH: Generator<H>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => void,
      ): void;
      <A, B, C, D, E, F, G, H>(
        description: string,
        opts: CheckOptions,
        genA: Generator<A>,
        genB: Generator<B>,
        genC: Generator<C>,
        genD: Generator<D>,
        genE: Generator<E>,
        genF: Generator<F>,
        genG: Generator<G>,
        genH: Generator<H>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => void,
      ): void;
    }
  };

  export var check: Check<'it' | 'xit' | 'iit' | 'fit'> & { it: Check<'only' | 'skip'> };
}
