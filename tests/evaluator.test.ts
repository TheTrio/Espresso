import { describe, expect, test } from '@jest/globals'
import { Evaluator } from '../src/evaluator'
import { Store } from '../src/store'
import { Parser } from '../src/parser'
import { SyntaxError, TypeMismatchError } from '../src/errors'

const getOutput = (input: string) => {
  const parser = new Parser(input)
  const tree = parser.parse()
  const evaluator = new Evaluator(tree, new Store())
  return evaluator.evaluate()
}

describe('Testing single line expressions', () => {
  test('simple expressions', () => {
    expect(getOutput('1 + 2')).toBe(3)
    expect(getOutput('4 - 5')).toBe(-1)
    expect(getOutput('2 * 3')).toBe(6)
    expect(getOutput('8 / 2')).toBe(4)
  })
  test('precedence', () => {
    expect(getOutput('1 + 2 * 3')).toBe(7)
    expect(getOutput('4 - 5 / 1')).toBe(-1)
    expect(getOutput('2 * 3 + 4')).toBe(10)
    expect(getOutput('8 / 2 - 1')).toBe(3)
  })
  test('parentheses', () => {
    expect(getOutput('(1 + 2) * 3')).toBe(9)
    expect(getOutput('4 - (5 / 1)')).toBe(-1)
    expect(getOutput('2 * (3 + 4)')).toBe(14)
    expect(getOutput('(8 / 2) - 1')).toBe(3)
  })
})

describe('Testing single line statements', () => {
  test('let statements', () => {
    expect(getOutput('let x = 1; x')).toBe(1)
    expect(getOutput('let x = 1; let y = 2; x + y')).toBe(3)
  })
  test('return statements', () => {
    expect(getOutput('return 1;')).toBe(1)
    expect(getOutput('return 1; return 2;')).toBe(1)
  })
})

describe('Testing functions', () => {
  test('function expressions', () => {
    expect(getOutput('fn(x) { x + 1 }(1)')).toBe(2)
    expect(getOutput('fn(x, y) { x + y }(1, 2)')).toBe(3)
  })
  test('function calls', () => {
    expect(getOutput('let add = fn(x, y) { x + y }; add(1, 2)')).toBe(3)
    expect(getOutput('let add = fn(x, y) { x + y }; add(1, add(2, 3))')).toBe(6)
  })
  test('function calls with return', () => {
    expect(getOutput('let add = fn(x, y) { return x + y; }; add(1, 2)')).toBe(3)
    expect(
      getOutput('let add = fn(x, y) { return x + y; }; add(1, add(2, 3))')
    ).toBe(6)
  })

  test('closure', () => {
    expect(
      getOutput(
        'let add = fn(x) { fn(y) { x + y } };let add2 = add(2); add2(3)'
      )
    ).toBe(5)
    expect(
      getOutput(
        `
      let makeCounter = fn() {
        let count = 0;
        return fn() {
          count = count + 1;
          return count;
        };
      };

      let counter = makeCounter();
      counter();
      counter();`
      )
    ).toBe(2)
    expect(
      getOutput(
        `
      let makeCounter = fn(increment) {
        let count = 0;
        return fn() {
          count = count + increment;
          return count;
        };
      };

      let counter = makeCounter(5);
      counter();
      counter();`
      )
    ).toBe(10)
  })

  test('recursion', () => {
    expect(
      getOutput(
        'let fact = fn(x) { if (x == 0) { return 1; } else { return x * fact(x - 1); } }; fact(5)'
      )
    ).toBe(120)
  })
  test('anonymous functions', () => {
    expect(getOutput('fn(a){fn(b){fn(c){a+b+c}}}(1)(2)(3)')).toBe(6)
    expect(getOutput('fn(a){fn(b){fn(c){a+b+c}}}(1)(2)')).toBe(
      'FUNCTION_OBJECT(c)'
    )
  })

  test('scoping', () => {
    expect(
      getOutput(
        `
          let x = 1;
          let func = fn(x){
            let y = 2;
            return x + y;
          };
          func(3);
        `
      )
    ).toBe(5)
    expect(
      getOutput(
        `
          let x = 1;
          let func = fn(x){let y = 2; return x + y;};
          y
        `
      )
    ).toBeUndefined()
    expect(
      getOutput(
        `
          let x = 1;
          let func = fn(x){
            let x = 2;
            return x + y;
          };
          x
        `
      )
    ).toBe(1)
  })
  test('with implicit return and return', () => {
    expect(
      getOutput(
        `
        let x = fn(num){
          if(num<11){
            return num + 10;
          }else{
            num - 10
          }
          {
            100
          }
        };
        x(10)
      `
      )
    ).toBe(20)
  })
})

describe('Testing if else', () => {
  test('if else expressions', () => {
    expect(getOutput('if (1 < 2) { 1 } else { 2 }')).toBe(1)
    expect(getOutput('if (1 > 2) { 1 } else { 2 }')).toBe(2)
  })
  test('nested if else', () => {
    expect(
      getOutput('if (1 < 2) { if (2 < 3) { 1 } else { 2 } } else { 3 }')
    ).toBe(1)
    expect(
      getOutput('if (1 > 2) { if (2 < 3) { 1 } else { 2 } } else { 3 }')
    ).toBe(3)
    expect(
      getOutput('if (1 < 2) { if (2 > 3) { 1 } else { 2 } } else { 3 }')
    ).toBe(2)
  })
  test('if else with return', () => {
    expect(getOutput('if (1 < 2) { return 1; } else { return 2; }')).toBe(1)
    expect(getOutput('if (1 > 2) { return 1; } else { return 2; }')).toBe(2)
  })
  test('if else variables', () => {
    expect(getOutput('let x = 1; if (x < 2) { x } else { 2 }')).toBe(1)
    expect(getOutput('let x = 3; if (x < 2) { x } else { 2 }')).toBe(2)
  })
  test('if else expression assignments', () => {
    expect(
      getOutput('let x = 1; let z = if (x < 2) { x } else { 2 };z*2')
    ).toBe(2)
    expect(
      getOutput('let x = 3; let z = if (x < 2) { x } else { 2 };z*2')
    ).toBe(4)
  })
})

describe('Testing booleans', () => {
  test('true and false', () => {
    expect(getOutput('true')).toBe(true)
    expect(getOutput('false')).toBe(false)
  })
  test('boolean expressions', () => {
    expect(getOutput('true == true')).toBe(true)
    expect(getOutput('true == false')).toBe(false)
    expect(getOutput('true != true')).toBe(false)
    expect(getOutput('true != false')).toBe(true)
  })
  test('if else with boolean expressions', () => {
    expect(getOutput('if (true == true) { 1 } else { 2 }')).toBe(1)
    expect(getOutput('if (true == false) { 1 } else { 2 }')).toBe(2)
    expect(getOutput('if (true != true) { 1 } else { 2 }')).toBe(2)
    expect(getOutput('if (true != false) { 1 } else { 2 }')).toBe(1)
  })

  test('if else with boolean variables', () => {
    expect(getOutput('let x = true; if (x) { 1 } else { 2 }')).toBe(1)
    expect(getOutput('let x = false; if (x) { 1 } else { 2 }')).toBe(2)
  })

  test('test with dynamic variables', () => {
    expect(getOutput('let x = 1; let y = 2; x + y == 3')).toBe(true)
    expect(getOutput('let x = 1; let y = 2; x + y == 4')).toBe(false)
  })
})

describe('block expressions', () => {
  test('simple block expressions', () => {
    expect(getOutput('{ 1 }')).toBe(1)
    expect(getOutput('{ 1; 2 }')).toBe(2)
    expect(getOutput('{ 1; 2; 3 }')).toBe(3)
    expect(getOutput('{ 1; 2; return 3; 4 }')).toBe(3)
  })
  test('block expressions with let', () => {
    expect(getOutput('{ let x = 1; x }')).toBe(1)
    expect(getOutput('{ let x = 1; let y = 2; x + y }')).toBe(3)
    expect(getOutput('{ let x = 1; let y = 2; return x + y; 4 }')).toBe(3)
  })
  test('assigning block expressions to variables', () => {
    expect(getOutput('let x = { 1; 2; 3 }; x')).toBe(3)
    expect(getOutput('let x = { 1; 2; return 3; 4 }; x')).toBe(3)
    expect(getOutput('let x = { let x = 100; let y = 2; x + y }; x')).toBe(102)
  })
  test('nested block expressions', () => {
    expect(getOutput('{ { 1 } }')).toBe(1)
    expect(getOutput('{ { 1; 2 } }')).toBe(2)
    expect(getOutput('{ { 1; 2; 3 } }')).toBe(3)
    expect(getOutput('{ { 1; 2; return 3; 4 } }')).toBe(3)
    expect(getOutput('{ { let x = 1; x } }')).toBe(1)
  })
})

describe('implicit return', () => {
  test('simple tests', () => {
    expect(getOutput('fn(x) { x + 1 }(1)')).toBe(2)
    expect(getOutput('fn(x) { x + 1 }(2)')).toBe(3)
    expect(getOutput('fn(x) { x + 1 }(3)')).toBe(4)
  })
  test('in if else', () => {
    expect(getOutput('if (true) { 1 } else { 2 }')).toBe(1)
    expect(getOutput('if (false) { 1 } else { 2 }')).toBe(2)
    expect(
      getOutput(
        `
        let x = if(true){
          let z = 10;
          z
        }else{
          20
        };
        x
      `
      )
    ).toBe(10)
  })
  test('in functions', () => {
    expect(
      getOutput(
        `
        let x = fn(x){
          x + 1
        };
        x(1)
      `
      )
    ).toBe(2)
    expect(
      getOutput(
        `
        let x = fn(x){
          x + 1
        };
        x(2)
      `
      )
    ).toBe(3)
    expect(
      getOutput(
        `
        let x = fn(num){
          if(num<11){
            num + 10
          }else{
            num - 10
          }
        };
        x(10)
      `
      )
    ).toBe(20)
  })
  test('with multiple implicit returns', () => {
    expect(
      getOutput(
        `
        let x = fn(num){
          if(num<11){
            num + 10
          }else{
            num - 10
          }
          {
            100
          }
        };
        x(10)
      `
      )
    ).toBe(100)
  })
})

describe('Strings', () => {
  test('simple tests', () => {
    expect(getOutput('"hello"')).toBe('hello')
    expect(getOutput('"hello" + "world"')).toBe('helloworld')
  })
  test('with variables', () => {
    expect(getOutput('let x = "hello"; x')).toBe('hello')
    expect(getOutput('let x = "hello"; let y = "world"; x + y')).toBe(
      'helloworld'
    )
  })
  test('with functions', () => {
    expect(getOutput('let x = fn() { return "hello"; }; x() + "world"')).toBe(
      'helloworld'
    )
  })
  test('with if else', () => {
    expect(
      getOutput(
        'let x = fn() { return "hello"; }; if (x()=="hello") { x() + "world" }'
      )
    ).toBe('helloworld')
  })
})

describe('Nulls', () => {
  test('simple tests', () => {
    expect(getOutput('null')).toBe(null)
    expect(getOutput('let x = null; x')).toBe(null)
    expect(getOutput('let x = null; let y = null; x == y')).toBe(true)
  })
  test('with if else', () => {
    expect(getOutput('if (null) { 1 } else { 2 }')).toBe(2)
    expect(getOutput('if (null == null) { 1 } else { 2 }')).toBe(1)
  })
})

describe('Miscellaneous tests', () => {
  test('simple tests', () => {
    expect(getOutput('let x = 1; let y = 2; x + y')).toBe(3)
    expect(getOutput('let x = 1; let y = 2; x + y == 3')).toBe(true)
    expect(getOutput('let x = 1; let y = 2; x + y == 4')).toBe(false)
  })
  test('simple tests with return', () => {
    expect(getOutput('let x = 1; let y = 2; return x + y;')).toBe(3)
    expect(getOutput('let x = 1; let y = 2; return x + y == 3;')).toBe(true)
    expect(getOutput('let x = 1; let y = 2; return x + y == 4;')).toBe(false)
  })
  test('simple tests with if else', () => {
    expect(
      getOutput('let x = 1; let y = 2; if (x + y == 3) { 1 } else { 2 }')
    ).toBe(1)
    expect(
      getOutput('let x = 1; let y = 2; if (x + y == 4) { 1 } else { 2 }')
    ).toBe(2)
  })
  test('simple tests with if else and return', () => {
    expect(
      getOutput(
        'let x = 1; let y = 2; if (x + y == 3) { return 1; } else { return 2; }'
      )
    ).toBe(1)
    expect(
      getOutput(
        'let x = 1; let y = 2; if (x + y == 4) { return 1; } else { return 2; }'
      )
    ).toBe(2)
  })
  test('simple tests with if else and return', () => {
    expect(
      getOutput(
        'let x = 1; let y = 2; if (x + y == 3) { return 1; } else { return 2; }'
      )
    ).toBe(1)
    expect(
      getOutput(
        'let x = 1; let y = 2; if (x + y == 4) { return 1; } else { return 2; }'
      )
    ).toBe(2)
  })
  test('simple tests with if else and return', () => {
    expect(
      getOutput(
        'let x = 1; let y = 2; if (x + y == 3) { return 1; } else { return 2; }'
      )
    ).toBe(1)
    expect(
      getOutput(
        'let x = 1; let y = 2; if (x + y == 4) { return 1; } else { return 2; }'
      )
    ).toBe(2)
  })
  test('longer tests', () => {
    const code = `
      let fib = fn(x) {
        if(x < 2) {
          return x;
        }
        return fib(x-1) + fib(x-2);
      };
      fib(10)
    `
    expect(getOutput(code)).toBe(55)
  })
})

describe('Error handling', () => {
  test('Data type errors', () => {
    expect(() => getOutput('1 + false')).toThrowError(TypeMismatchError)
    expect(() => getOutput('true / false')).toThrowError(TypeMismatchError)
    expect(() => getOutput('"1" + 1')).toThrowError(TypeMismatchError)
    expect(() => getOutput('"1" - "1"')).toThrowError(TypeMismatchError)
  })
  test('Syntax errors', () => {
    expect(() => getOutput('1 +')).toThrowError(SyntaxError)
    expect(() => getOutput('1 + 2 +')).toThrowError(SyntaxError)
    expect(() => getOutput('let x = 1')).toThrowError(SyntaxError)
    expect(() => getOutput('let x = {1')).toThrowError(SyntaxError)
    expect(() => getOutput('let x = fn() { return 1')).toThrowError(SyntaxError)
    expect(() => getOutput('"a')).toThrowError(SyntaxError)
  })

  test('Unmatched function calls', () => {
    expect(() => getOutput('let func = fn(a){a};func(10,10)')).toThrowError(
      Error
    )
    expect(() => getOutput('fn(a){a}(10,10)')).toThrowError(Error)
  })
})
