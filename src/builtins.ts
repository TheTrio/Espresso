import { Store } from './store'
import { FunctionObject, NativeFunction } from './types'

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
      throw new Error('Expected string, got ' + typeof arg)
    })
  )
  return builtins
}
