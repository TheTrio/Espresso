import { Store } from './store'
import {
  ArrayObject,
  FunctionObject,
  IterableObject,
  NativeFunction,
} from './types'

export const createBuiltins = () => {
  const builtins = new Store()
  builtins.set(
    'print',
    new NativeFunction('print', (...args) => {
      console.log(
        ...args.map((arg) => {
          if (arg instanceof FunctionObject) {
            return arg.asString()
          }
          return arg
        })
      )
    })
  )
  builtins.set(
    'len',
    new NativeFunction('len', (arg: any) => {
      if (typeof arg === 'string') {
        return arg.length
      }
      if (arg instanceof IterableObject) {
        return arg._length()
      }
      throw new Error('Expected iterable, got ' + typeof arg)
    })
  )
  builtins.set(
    'push',
    new NativeFunction('push', (arr: ArrayObject, value: any) => {
      if (!(arr instanceof ArrayObject)) {
        throw new Error('Expected array, got ' + typeof arr)
      }
      arr.elements.push(value)
    })
  )

  builtins.set(
    'pop',
    new NativeFunction('shift', (arr: ArrayObject, index?: any) => {
      if (!(arr instanceof ArrayObject)) {
        throw new Error('Expected array, got ' + typeof arr)
      }
      if (index === undefined) {
        if (arr.elements.length === 0) {
          throw new Error('Cannot pop from empty array')
        }
        return arr.elements.pop()
      }
      if (typeof index !== 'number') {
        throw new Error('Expected number, got ' + typeof index)
      }
      if (index < 0 || index >= arr.elements.length) {
        throw new Error('Index out of bounds')
      }
      return arr.elements.splice(index, 1)[0]
    })
  )

  return builtins
}
