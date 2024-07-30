import { Store } from './store'
import { ArrayObject, FunctionObject, NativeFunction } from './syntax/objects'
import { IterableObject } from './types'

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
      arr.push(value)
    })
  )

  builtins.set(
    'pop',
    new NativeFunction('shift', (arr: ArrayObject, index?: any) => {
      if (!(arr instanceof ArrayObject)) {
        throw new Error('Expected array, got ' + typeof arr)
      }
      return arr.pop(index)
    })
  )

  return builtins
}
