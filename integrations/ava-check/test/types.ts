import test from 'ava';
import { gen, check } from '../';

test('generates', check(gen.int, gen.string, (t, x, y) => {
  t.true(x * y === 321)
}))
