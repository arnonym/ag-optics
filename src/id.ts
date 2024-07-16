import { Lens } from "./lens";

export const id = <A>(): Lens<A, A> => ({
  get: (o) => o,
  set: (o) => (_) => o,
});
