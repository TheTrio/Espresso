import { Evaluator } from './evaluator'
import { Parser } from './parser'
// import process
import repl from 'repl'

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
    const evaluator = new Evaluator(tree)
    try {
      console.log(evaluator.evaluate())
    } catch (e: any) {
      console.log('Runtime error: ', e.message)
    }
    callback(null)
  },
})

r.on('exit', () => {
  console.log('Goodbye!')
})
