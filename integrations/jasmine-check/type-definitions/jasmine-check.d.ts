import { ValueGenerator, CheckOptions } from 'testcheck';

declare global {
  type Check<Key extends string> = {
    [checker in Key]: {
      (description: string, opts?: CheckOptions): void;
      (description: string, fn: () => void): void;
      (description: string, opts: CheckOptions, fn: () => void): void;
      <A>(description: string, genA: ValueGenerator<A>, fn: (a: A) => void): void;
      <A>(description: string, opts: CheckOptions, genA: ValueGenerator<A>, fn: (a: A) => void): void;
      <A, B>(description: string, genA: ValueGenerator<A>, genB: ValueGenerator<B>, fn: (a: A, b: B) => void): void;
      <A, B>(
        description: string,
        opts: CheckOptions,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        fn: (a: A, b: B) => void,
      ): void;
      <A, B, C>(
        description: string,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        fn: (a: A, b: B, c: C) => void,
      ): void;
      <A, B, C>(
        description: string,
        opts: CheckOptions,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        fn: (a: A, b: B, c: C) => void,
      ): void;
      <A, B, C, D>(
        description: string,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        fn: (a: A, b: B, c: C, d: D) => void,
      ): void;
      <A, B, C, D>(
        description: string,
        opts: CheckOptions,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        fn: (a: A, b: B, c: C, d: D) => void,
      ): void;
      <A, B, C, D, E>(
        description: string,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        fn: (a: A, b: B, c: C, d: D, e: E) => void,
      ): void;
      <A, B, C, D, E>(
        description: string,
        opts: CheckOptions,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        fn: (a: A, b: B, c: C, d: D, e: E) => void,
      ): void;
      <A, B, C, D, E, F>(
        description: string,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        genF: ValueGenerator<F>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F) => void,
      ): void;
      <A, B, C, D, E, F>(
        description: string,
        opts: CheckOptions,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        genF: ValueGenerator<F>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F) => void,
      ): void;
      <A, B, C, D, E, F, G>(
        description: string,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        genF: ValueGenerator<F>,
        genG: ValueGenerator<G>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => void,
      ): void;
      <A, B, C, D, E, F, G>(
        description: string,
        opts: CheckOptions,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        genF: ValueGenerator<F>,
        genG: ValueGenerator<G>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => void,
      ): void;
      <A, B, C, D, E, F, G, H>(
        description: string,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        genF: ValueGenerator<F>,
        genG: ValueGenerator<G>,
        genH: ValueGenerator<H>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => void,
      ): void;
      <A, B, C, D, E, F, G, H>(
        description: string,
        opts: CheckOptions,
        genA: ValueGenerator<A>,
        genB: ValueGenerator<B>,
        genC: ValueGenerator<C>,
        genD: ValueGenerator<D>,
        genE: ValueGenerator<E>,
        genF: ValueGenerator<F>,
        genG: ValueGenerator<G>,
        genH: ValueGenerator<H>,
        fn: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => void,
      ): void;
    }
  };

  export var check: Check<'it' | 'xit' | 'iit' | 'fit'> & { it: Check<'only' | 'skip'> };
}
