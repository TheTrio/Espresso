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
    try {
      const tree = parser.parse()
      const evaluator = new Evaluator(tree, store)
      try {
        const result = evaluator.evaluate()
        if (result !== null) {
          console.log(result)
        }
      } catch (e: any) {
        console.log('Runtime error: ', e.message)
      }
      callback(null)
    } catch (e: any) {
      console.log('Parsing Error:', e.errors)
      return callback(null)
    }
  },
})

r.on('exit', () => {
  console.log('Goodbye!')
})
