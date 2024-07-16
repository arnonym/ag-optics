export type Lens<S, D> = {
  get: (s: S) => D;
  set: (d: D) => (s: S) => S;
};

export const propertyLens = <S, Key extends keyof S>(
  key: Key,
): Lens<S, S[Key]> => ({
  get: o => o[key],
  set: v => o => ({ ...o, [key]: v }),
});

const composeLens =
  <S, A, D>(ad: Lens<A, D>) =>
  (sa: Lens<S, A>): Lens<S, D> => ({
    get: s => ad.get(sa.get(s)),
    set: b => s => sa.set(ad.set(b)(sa.get(s)))(s),
  });

type LensCompose<S, A, D> = (p: Lens<S, A>) => Lens<S, D>;

export const prop = <S, A, Key extends keyof A>(
  key: Key,
): LensCompose<S, A, A[Key]> => {
  const property = propertyLens<A, Key>(key);
  return sa => composeLens<S, A, A[Key]>(property)(sa);
};
