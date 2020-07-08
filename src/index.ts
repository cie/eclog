//import debug from './debug'

type Variable<T> = {
  eclog: Eclog<T>
  it: Iterator<T>
  current: IteratorResult<T>
}
type Stack = Variable<any>[]
type Eclog<T> = {
  (): T
  [Symbol.iterator]: () => Generator<T, void>
}

type Branch<R> = (() => R) | R

let current_stack: Stack
let current_stack_pointer: number

function $<T> (...branches: (T | (() => T))[]): Eclog<T> {
  const eclog = function () {
    if (current_stack_pointer >= current_stack.length) {
      const it = eclog[Symbol.iterator]()
      const current = it.next()
      if (current.done) throw new Failed()
      current_stack.push({ eclog, it, current })
      ++current_stack_pointer
      return current.value
    } else {
      const value = current_stack[current_stack_pointer].current.value
      ++current_stack_pointer
      return value
    }
  }
  eclog[Symbol.iterator] = function * () {
    for (const branch of branches.map(evalBranch)) {
      let stack: Stack = []
      do {
        const last_stack = current_stack
        const last_stack_pointer = current_stack_pointer
        current_stack = stack
        current_stack_pointer = 0
        let res
        try {
          res = branch()
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
  return eclog
}

export default $

function advance (stack: Stack) {
  for (let i = stack.length - 1; i >= 0; --i) {
    stack[i].current = stack[i].it.next()
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

function evalBranch<R> (branch: Branch<R>): () => R {
  return branch instanceof Function ? branch : () => branch
}

export const fail = $()
