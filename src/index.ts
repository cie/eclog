//import debug from './debug'

type Variable<T, A extends unknown[]> = {
  eclog: Eclog<T, A>
  it: Iterator<T, void, void>
  current: IteratorResult<T>
}
type Stack = Variable<any, any>[]
type Eclog<T, A extends unknown[] = []> = {
  (...args: A): T
  branches_stack: Branch<T, A>[][]
  [Symbol.iterator]: (args: A) => Generator<T, void, void>
  map: <R>(fn: (el: T) => R) => R[]
}

type Branch<T, A extends unknown[]> = ((...args: A) => T) | T

let current_stack: Stack
let current_stack_pointer: number

function $<T, A extends unknown[]> (
  ...branches: (T | ((...args: A) => T))[]
): Eclog<T, A> {
  const eclog: Eclog<T, A> = function (...myArgs: A) {
    const stack = current_stack ?? ((current_stack_pointer = 0), []) // called outside of computation
    const existingVar = stack.findIndex(v => v.eclog === eclog)
    if (~existingVar && existingVar < current_stack_pointer) {
      return stack[existingVar].current.value
    } else if (current_stack_pointer >= stack.length) {
      const it = eclog[Symbol.iterator](myArgs)
      const current = it.next()
      if (current.done) throw new Failed()
      stack.push({ eclog, it, current })
      ++current_stack_pointer
      return current.value
    } else {
      const value = stack[current_stack_pointer].current.value
      ++current_stack_pointer
      return value
    }
  }
  eclog.branches_stack = [branches]
  eclog[Symbol.iterator] = function * (myArgs: A = [] as any) {
    const branches = eclog.branches_stack[0]
    for (const branch of branches.map(evalBranch)) {
      let stack: Stack = []
      do {
        const last_stack = current_stack
        const last_stack_pointer = current_stack_pointer
        current_stack = stack
        current_stack_pointer = 0
        let res
        try {
          res = branch(...myArgs)
        } catch (e) {
          if (e instanceof Failed) continue
          throw e
        } finally {
          current_stack = last_stack
          current_stack_pointer = last_stack_pointer
        }
        yield res
      } while (advance(stack))
    }
  }
  eclog.map = function<R> (fn: (el: T) => R): R[] {
    const res = [] as R[]
    for (const el of eclog) res.push(fn(el))
    return res
  }
  return eclog
}

function advance (stack: Stack) {
  for (let i = stack.length - 1; i >= 0; --i) {
    stack[i].current = stack[i].it.next()
    if (!stack[i].current.done) return true
    stack.splice(i)
  }
  return false
}

export default $

export class Failed extends Error {
  constructor () {
    super('Failed')
  }
}

function evalBranch<T, A extends unknown[]> (
  branch: Branch<T, A>
): (...args: A) => T {
  return branch instanceof Function ? branch : () => branch
}

export const fail: Eclog<never> = $()

export function when<T extends string | number | symbol, R> (
  x: T,
  cases: { [K in T]: (() => R) | R }
): R {
  if (x in cases) {
    const c = cases[x]
    return c instanceof Function ? c() : c
  }
  return fail()
}

export const set = $<any, any[]>(
  <T, A extends unknown[]>(eclog: Eclog<T, A>, ...branches: Branch<T, A>[]) => {
    eclog.branches_stack.unshift(branches)
  },
  <T, A extends unknown[]>(eclog: Eclog<T, A>, ...branches: Branch<T, A>[]) => {
    eclog.branches_stack.shift()
    fail()
  }
)

export const reset = (eclog: Eclog<any, any>) =>
  set(eclog, ...eclog.branches_stack[eclog.branches_stack.length - 1])
