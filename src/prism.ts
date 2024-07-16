type Prism<S, D> = {
  get: (s: S) => D | undefined;
  set: (d: D) => (s: S) => S;
};

export const propertyPrism = <S, Key extends keyof S>(
  key: Key,
): Prism<S, NonNullable<S[Key]>> => ({
  get: o => o[key]!,
  set: v => o => ({ ...o, [key]: v }),
});

const arrayIndexPrismFactory = <T>(
  idxFn: (o: T[]) => number,
): Prism<T[], T> => ({
  get: o => o[idxFn(o)],
  set: v => o => {
    const idx = idxFn(o);
    if (idx === -1) {
      return o;
    }
    const copy = o.slice();
    copy[idx] = v;
    return copy;
  },
});

const indexPrism = <T>(index: number) => arrayIndexPrismFactory<T>(_ => index);

export const findFirstPrism = <T>(predicate: (a: T) => boolean) =>
  arrayIndexPrismFactory<T>(o => o.findIndex(predicate));

export const findLastPrism = <T>(predicate: (a: T) => boolean) =>
  arrayIndexPrismFactory<T>(o => o.findLastIndex(predicate));

const composePrism =
  <S, A, D>(ad: Prism<A, D>) =>
  (sa: Prism<S, A>): Prism<S, D> => ({
    get: s => {
      const source = sa.get(s);
      if (!source) {
        return undefined;
      }
      return ad.get(source);
    },
    set: b => s => {
      const source = sa.get(s);
      if (!source) {
        return s;
      }
      return sa.set(ad.set(b)(source))(s);
    },
  });

type PrismCompose<S, A, D> = (p: Prism<S, A>) => Prism<S, D>;

export const prop =
  <S, A, Key extends keyof A>(
    key: Key,
  ): PrismCompose<S, A, NonNullable<A[Key]>> =>
  sa =>
    composePrism<S, A, NonNullable<A[Key]>>(propertyPrism<A, Key>(key))(sa);

export const idx =
  <S, A>(index: number): PrismCompose<S, A[], A> =>
  sa =>
    composePrism<S, A[], A>(indexPrism<A>(index))(sa);

export const findFirst =
  <S, A>(predicate: (i: A) => boolean): PrismCompose<S, A[], A> =>
  sa =>
    composePrism<S, A[], A>(findFirstPrism<A>(predicate))(sa);

export const findLast =
  <S, A>(predicate: (i: A) => boolean): PrismCompose<S, A[], A> =>
  sa =>
    composePrism<S, A[], A>(findLastPrism<A>(predicate))(sa);
