import { Evaluator } from './evaluator'
import { Parser } from './parser'
// import process
import repl from 'repl'
import { Store } from './store'

const store = new Store()
const r = repl.start({
  prompt: '> ',
  eval: (code: string, context: any, filename: any, callback: any) => {
    const parser = new Parser(code)
    const tree = parser.parse()
    const errors = parser.errors
    if (errors.length > 0) {
      console.log('Parsing Error:', errors[0])
      return callback(null)
    }
    const evaluator = new Evaluator(tree, store)
    try {
      console.dir(evaluator.evaluate(), { depth: null })
    } catch (e: any) {
      console.log('Runtime error: ', e.message)
    }
    callback(null)
  },
})

r.on('exit', () => {
  console.log('Goodbye!')
})
