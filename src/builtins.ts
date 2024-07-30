import { Store } from './store'
import {
  ArrayObject,
  DictionaryObject,
  FunctionObject,
  NativeFunction,
} from './syntax/objects'
import { IterableObject } from './types'
import { isObject } from './utils'

export const createBuiltins = () => {
  const builtins = new Store()
  builtins.set(
    'print',
    new NativeFunction('print', (...args) => {
      console.log(
        ...args.map((arg) => {
          if (isObject(arg)) {
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
    new NativeFunction('pop', (arr: ArrayObject, index?: any) => {
      if (!(arr instanceof ArrayObject)) {
        throw new Error('Expected array, got ' + typeof arr)
      }
      return arr.pop(index)
    })
  )

  builtins.set(
    'dict',
    new NativeFunction('dict', () => {
      return new DictionaryObject(new Map())
    })
  )

  builtins.set(
    'str',
    new NativeFunction('str', (arg: any) => {
      if (typeof arg === 'string') {
        return arg
      }
      if (arg === null) {
        throw new Error('Cannot convert null to string')
      }
      switch (typeof arg) {
        case 'number':
        case 'boolean':
          return `${arg}`
      }
      if (arg?.asString) {
        return arg.asString()
      }
    })
  )

  return builtins
}
