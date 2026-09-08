/** An array the type system knows has at least one element.
 * Lets `xs[0]` type as `T` rather than `T | undefined` under
 * `noUncheckedIndexedAccess`. See CLAUDE.md. */
export type NonEmptyArray<T> = [T, ...T[]];

export interface Plant {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
}

export interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
}
