import * as test from 'tape';
import { gen, check } from '../';

test('generates', check(gen.int, gen.string, (t, x, y) => {
  t.plan(1)
  t.true(x * y === 321)
}))
