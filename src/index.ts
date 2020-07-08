//import debug from './debug'

type Variable<T, A extends unknown[]> = {
  eclog: Eclog<T, A>
  it: Iterator<T, void, A>
  current: IteratorResult<T>
}
type Stack = Variable<any, any>[]
type Eclog<T, A extends unknown[] = []> = {
  (...args: A): T
  [Symbol.iterator]: (args: A) => Generator<T, void, A | undefined>
}

type Branch<T, A extends unknown[]> = ((...args: A) => T) | T

let current_stack: Stack
let current_stack_pointer: number

function $<T, A extends unknown[]> (
  ...branches: (T | ((...args: A) => T))[]
): Eclog<T, A> {
  const eclog: Eclog<T, A> = function (...args: A) {
    const stack = current_stack ?? ((current_stack_pointer = 0), [])
    if (current_stack_pointer >= stack.length) {
      const it = eclog[Symbol.iterator](args)
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
  eclog[Symbol.iterator] = function * (args: A = [] as any) {
    for (const branch of branches.map(evalBranch)) {
      let stack: Stack = []
      do {
        const last_stack = current_stack
        const last_stack_pointer = current_stack_pointer
        current_stack = stack
        current_stack_pointer = 0
        let res
        try {
          res = branch(...args)
        } catch (e) {
          if (e instanceof Failed) continue
          throw e
        } finally {
          current_stack = last_stack
          current_stack_pointer = last_stack_pointer
        }
        args = (yield res) ?? ([] as any)
      } while (advance(stack, args))
    }
  }
  return eclog
}

export default $

function advance (stack: Stack, args: any[]) {
  for (let i = stack.length - 1; i >= 0; --i) {
    stack[i].current = stack[i].it.next(args)
    if (!stack[i].current.done) return true
    stack.splice(i)
  }
  return false
}

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

export function when<T, R> (x: T, branches: [T, R][]): R {
  for (const [pattern, value] of branches) {
    if (x === pattern) return value
  }
  return fail()
}
