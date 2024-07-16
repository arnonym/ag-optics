import { describe, expect, test } from '@jest/globals';
import { pipe } from './pipe';
import { findFirst, idx, prop, propertyPrism } from './prism';
import { id } from './id';

interface Test {
  a: {
    a1: number;
    a2?: string;
    a3: string[];
  };
  b?: {
    b1: string;
    b2?: string;
    b3: string[];
  };
}

const x: Test = {
  a: {
    a1: 2,
    a3: ['a', 'b'],
  },
};

const j = ['x', 'y', 'z'];

describe('prisms', () => {
  describe('propertyPrism', () => {
    test('on required value', () => {
      const propPrism = propertyPrism<Test, 'a'>('a');
      expect(propPrism.get(x)).toEqual({ a1: 2, a3: ['a', 'b'] });
    });
    test('on optional non-existing value', () => {
      const propPrism = propertyPrism<Test, 'b'>('b');
      const val = propPrism.get(x);
      expect(val).toBeUndefined();
    });
    test('on optional existing value', () => {
      const propPrism = propertyPrism<Test, 'b'>('b');
      const b = { b1: 'hey', b3: ['a'] };
      expect(propPrism.get({ ...x, b })).toEqual(b);
    });
    test('on non-existing property', () => {
      // @ts-expect-error TS2345
      propertyPrism<Test, 'b'>('x');
    });
    test('on wrong type', () => {
      const propPrism = propertyPrism<Test, 'a'>('a');
      // @ts-expect-error TS2353
      propPrism.get({ x: 1 });
    });
  });

  describe('get', () => {
    test('attr', () => {
      const prism = pipe(id<Test>(), prop('a'), prop('a1'));
      expect(prism.get(x)).toEqual(2);
    });
    test('attr not set', () => {
      const prism = pipe(id<Test>(), prop('a'), prop('a2'));
      expect(prism.get(x)).toBeUndefined();
    });
    test('idx', () => {
      const prism = pipe(id<string[]>(), idx(2));
      expect(prism.get(j)).toEqual('z');
    });
    test('idx not set', () => {
      const prism = pipe(id<string[]>(), idx(5));
      expect(prism.get(j)).toBeUndefined();
    });
    test('findFirst', () => {
      const prism = pipe(
        id<string[]>(),
        findFirst(i => i === 'y'),
      );
      expect(prism.get(j)).toEqual('y');
    });
    test('findFirst not found', () => {
      const prism = pipe(
        id<string[]>(),
        findFirst(i => i === 'a'),
      );
      expect(prism.get(j)).toBeUndefined();
    });
  });

  describe('set', () => {
    test('attr', () => {
      const prism = pipe(id<Test>(), prop('a'), prop('a1'));
      expect(prism.set(5)(x)).toEqual({
        a: { a1: 5, a3: ['a', 'b'] },
      });
    });
    test('attr not set', () => {
      const prism = pipe(id<Test>(), prop('a'), prop('a2'));
      expect(prism.set('new')(x)).toEqual({
        a: {
          a1: 2,
          a2: 'new',
          a3: ['a', 'b'],
        },
      });
    });
    test('idx', () => {
      const prism = pipe(id<string[]>(), idx(2));
      expect(prism.set('changed')(j)).toEqual(['x', 'y', 'changed']);
    });
    test('idx not set', () => {
      const prism = pipe(id<string[]>(), idx(5));
      expect(prism.set('new')(j)).toEqual([
        'x',
        'y',
        'z',
        undefined,
        undefined,
        'new',
      ]);
    });
    test('idx parent not set', () => {
      const prism = pipe(id<Test>(), prop('b'), prop('b3'), idx(0));
      const test = {
        a: {
          a1: 2,
          a3: ['a', 'b'],
        },
      };
      const result = prism.set('c')(test);
      expect(result).toEqual(test);
    });
  });
});
