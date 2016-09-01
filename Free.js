// @flow
import type { Functor } from './Functor'
import type { Monad } from './Monad'
import type { HKT2 } from './HKT'

import { HKT } from './HKT'
import { Data1 } from './Data'

class IsFree {}

// we can think of a free monad as just being a list of functors

class Cons<F, A> extends Data1<HKT<F, Free<F, A>>> {}

class Nil<A> extends Data1<A> {}

export type FreeV<F, A> = Nil<A> | Cons<F, A>;

export type Free<F, A> = HKT2<IsFree, F, A>;

export function inj<F, A>(f: FreeV<F, A>): Free<F, A> {
  return ((f: any): Free<F, A>)
}

export function prj<F, A>(fa: Free<F, A>): FreeV<F, A> {
  return ((fa: any): FreeV<F, A>)
}

export function of<F, A>(a: A): Free<F, A> {
  return inj(new Nil(a))
}

export function cons<F, A>(ffa: HKT<F, Free<F, A>>): Free<F, A> {
  return inj(new Cons(ffa))
}

export function liftF<F, A>(functor: Functor<F>, fa: HKT<F, A>): Free<F, A> {
  return cons(functor.map(of, fa))
}

export function freeMonad<F>(functor: Functor<F>): Monad<HKT<IsFree, F>> {

  function map<A, B>(f: (a: A) => B, fa: Free<F, A>): Free<F, B> {
    const a = prj(fa)
    if (a instanceof Nil) {
      return of(f(a.value0))
    }
    return cons(functor.map(x => map(f, x), a.value0))
  }

  function ap<A, B>(fab: Free<F, (a: A) => B>, fa: Free<F, A>): Free<F, B> {
    return chain(f => map(f, fa), fab) // <= derived
  }

  function join<A>(ffa: Free<F, Free<F, A>>): Free<F, A> {
    const fa = prj(ffa)
    if (fa instanceof Nil) {
      return fa.value0
    }
    return cons(functor.map(join, fa.value0))
  }

  function chain<A, B>(f: (a: A) => Free<F, B>, fa: Free<F, A>): Free<F, B> {
    return join(map(f, fa)) // <= derived
  }

  return {
    map,
    ap,
    of,
    chain
  }

}
