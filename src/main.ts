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
      console.log('Whoops! We ran into some errors:')
      console.log(errors[0])
      return callback(null)
    }
    console.dir(tree, { depth: null })
    callback(null)
  },
})
