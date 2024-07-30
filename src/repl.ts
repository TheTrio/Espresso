import { Evaluator } from './evaluator'
import { Parser } from './parser'
import repl from 'repl'
import { Store } from './store'
import { SyntaxError } from './errors'
import { createBuiltins } from './builtins'
import { asString } from './utils'

const store = new Store(createBuiltins())
const r = repl.start({
  prompt: '> ',
  eval: (code: string, context: any, filename: any, callback: any) => {
    try {
      const parser = new Parser(code)
      const tree = parser.parse()
      const evaluator = new Evaluator(tree, store)
      try {
        const result = evaluator.evaluate()
        console.log(asString(result))
      } catch (e: any) {
        console.log('Runtime error: ', e.message)
      }
      callback(null)
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        console.log('Parsing Error:', e.errors)
      } else {
        console.log(e.message)
      }
      return callback(null)
    }
  },
})

r.on('exit', () => {
  console.log('Goodbye!')
})
