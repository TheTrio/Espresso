import { describe, expect, test } from '@jest/globals'
import { Evaluator } from '../src/evaluator'
import { Store } from '../src/store'
import { Parser } from '../src/parser'
import {
  IterableIndexOutOfBoundsError,
  SyntaxError,
  TypeMismatchError,
  VariableNotFoundError,
} from '../src/errors'
import {
  ArrayObject,
  DictionaryObject,
  FunctionObject,
} from '../src/syntax/objects'
const getOutput = (input: string) => {
  const parser = new Parser(input)
  const tree = parser.parse()
  const evaluator = new Evaluator(tree, {
    store: new Store(),
  })
  return evaluator.evaluate()
}

describe('Testing single line expressions', () => {
  test('simple expressions', () => {
    expect(getOutput('1 + 2')).toBe(3)
    expect(getOutput('4 - 5')).toBe(-1)
    expect(getOutput('2 * 3')).toBe(6)
    expect(getOutput('8 / 2')).toBe(4)
    expect(getOutput('1 + 2 + "3"')).toBe('33')
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
    expect(getOutput('fn(a){fn(b){fn(c){a+b+c}}}(1)(2)')).toBeInstanceOf(
      FunctionObject
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
    expect(() =>
      getOutput(
        `
          let x = 1;
          let func = fn(x){let y = 2; return x + y;};
          y
        `
      )
    ).toThrow(VariableNotFoundError)
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

describe('If/else', () => {
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
  test('variables declared in if else are not accessible outside', () => {
    expect(() =>
      getOutput(`
      let _ = if(true){
        let x = 10;
        return {
          return x + 10;
        };
      };
      x
    `)
    ).toThrow(VariableNotFoundError)
  })

  test('values returned are accessible outside', () => {
    expect(
      getOutput(`
      let y = if(true){
        let x = 10;
        return {
          return x + 10;
        };
      };
      y
    `)
    ).toBe(20)
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
  test('Shadowing variables', () => {
    expect(
      getOutput(
        `
        let x = 1;
        {
          let x = 2;
          x
        }
      `
      )
    ).toBe(2)
    expect(
      getOutput(
        `
        let x = 1;
        {
          let x = 2;
        }
        x
      `
      )
    ).toBe(1)
  })
  test('returning from block does not bubble', () => {
    expect(
      getOutput(
        `
        let x = 1;
        {
          return 2;
        }
        x
      `
      )
    ).toBe(1)
  })

  test('variables declared in block are not accessible outside', () => {
    expect(() =>
      getOutput(`
      let _ = {
        let x = 10;
        return 100;
      };
      x
    `)
    ).toThrow(VariableNotFoundError)
  })

  test('nested, returned values are accessible', () => {
    expect(
      getOutput(`
      let x = {
        let x1 = {
          let y = 5;
          let x2 = {
            let x3 = 5;
            return x3 + y;
          };
          return x2;
        };
        return x1;
      };
      x
    `)
    ).toBe(10)
  })
})

describe('while expressions', () => {
  test('simple tests', () => {
    expect(getOutput('let x = 0; while (x < 10) { x = x + 1; } x')).toBe(10)
  })
  test('with block expressions', () => {
    expect(
      getOutput(
        `
        let x = 0;
        while (x < 10) {
          {
            x = x + 1;
          }
        }
        x
      `
      )
    ).toBe(10)
  })
  test('with return', () => {
    expect(
      getOutput(
        `
        let x = 0;
        while (x < 10) {
          {
            x = x + 1;
          }
        }
        return x;
      `
      )
    ).toBe(10)
  })

  test('false condition', () => {
    expect(
      getOutput(
        `
        while (false) {}
      `
      )
    ).toBe(undefined)
  })

  test('nested while', () => {
    expect(
      getOutput(
        `
        let x = 0;
        let ans = 0;
        while (x < 10) {
          let y = 0;
          while (y < 10) {
            y = y + 1;
            ans = ans + 1;
          }
          x = x + 1;
        }
        ans
      `
      )
    ).toBe(100)
  })

  test('while with return', () => {
    expect(
      getOutput(
        `
        let count = 1;
        while(count<=10){
          count = count + 1;
          if(count==5){
            return count;
          }
        }
      `
      )
    ).toBe(5)
  })

  test('while with if else', () => {
    expect(
      getOutput(
        `
        let count = 1;
        while(count<=10){
          if(count==5){
            return count;
          }else{
            count = count + 1;
          }
        }
      `
      )
    ).toBe(5)
  })

  test('returning from nested while does not return from both loops', () => {
    expect(
      getOutput(
        `
        let count = 1;
        while(count<=10){
          let count2 = 1;
          while(count2<=10){
            count2 = count2 + 1;
            if(count2==5){
              return "dumb";
            }
          }
          count = count + 1;
        }
      `
      )
    ).toBe('dumb')
  })

  test('variables declared in while are not accessible outside', () => {
    expect(() =>
      getOutput(`
      let _ = while(true){
        let x = 10;
        return 100;
      };
      x
    `)
    ).toThrow(VariableNotFoundError)
  })

  test('but returned values can be computed', () => {
    expect(
      getOutput(`
      let _ = while(true){
        let x = 10;
        return x;
      };
      _
    `)
    ).toBe(10)
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

describe('Arrays', () => {
  test('simple tests', () => {
    expect(getOutput('[]')).toBeInstanceOf(ArrayObject)
    expect(getOutput('[1, 2, 3]')).toStrictEqual(new ArrayObject([1, 2, 3]))
    expect(getOutput('[1, 2, 3][0]')).toBe(1)
    expect(getOutput('[1, 2, 3][1]')).toBe(2)
    expect(getOutput('[1, 2, 3][2]')).toBe(3)
  })
  test('with variables', () => {
    expect(getOutput('let x = [1, 2, 3]; x[0]')).toBe(1)
    expect(getOutput('let x = [1, 2, 3]; x[1]')).toBe(2)
    expect(getOutput('let x = [1, 2, 3]; x[2]')).toBe(3)
  })
  test('with functions', () => {
    expect(getOutput('let x = fn() { return [1, 2, 3]; }; x()[0]')).toBe(1)
    expect(getOutput('let x = fn() { return [1, 2, 3]; }; x()[1]')).toBe(2)
    expect(getOutput('let x = fn() { return [1, 2, 3]; }; x()[2]')).toBe(3)
  })

  test('with if else', () => {
    expect(
      getOutput(
        'let x = fn() { return [1, 2, 3]; }; if (x()[0] == 1) { x()[0] }'
      )
    ).toBe(1)
    expect(
      getOutput(
        'let x = fn() { return [1, 2, 3]; }; if (x()[1] == 2) { x()[1] }'
      )
    ).toBe(2)
    expect(
      getOutput(
        'let x = fn() { return [1, 2, 3]; }; if (x()[2] == 3) { x()[2] }'
      )
    ).toBe(3)
  })

  test('works as references', () => {
    expect(
      getOutput(
        `
        let x = [1, 2, 3];
        let y = x;
        y[0] = 10;
        x[0]
      `
      )
    ).toBe(10)
    expect(
      getOutput(
        `
        let x = [1, 2, 3];
        let y = x;
        x = [10, 20, 30];
        y
      `
      )
    ).toStrictEqual(new ArrayObject([1, 2, 3]))
  })

  test('with different types', () => {
    expect(getOutput('[1, "hello", true]')).toStrictEqual(
      new ArrayObject([1, 'hello', true])
    )
    expect(getOutput('[1, "hello", true][0]')).toBe(1)
    expect(getOutput('[fn(x){x*x}, "hello", true][0](10)')).toBe(100)
  })
})

describe('Dictionaries', () => {
  test('simple tests', () => {
    expect(getOutput('{"a": 1}')).toStrictEqual(
      new DictionaryObject(new Map([['a', 1]]))
    )
    expect(getOutput('{"a": 1, "b": 2}')).toStrictEqual(
      new DictionaryObject(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    )
    expect(getOutput('{"a": 1, "b": 2}["a"]')).toBe(1)
    expect(getOutput('{"a": 1, "b": 2}["b"]')).toBe(2)
    expect(getOutput('{"a": 1, "b": 2}["c"]')).toBe(null)
  })

  test('with variables', () => {
    expect(getOutput('let x = {"a": 1, "b": 2}; x["a"]')).toBe(1)
    expect(getOutput('let x = {"a": 1, "b": 2}; x["b"]')).toBe(2)
    expect(getOutput('let x = {"a": 1, "b": 2}; x["c"]')).toBe(null)

    expect(getOutput('let x = {"a": 1, "b": 2}; x["a"] + x["b"]')).toBe(3)

    expect(
      getOutput(`
      let y = fn(x){x + x};
      let x = {"a": 1, "func": y};
      y = "hello";
      x["func"](10)
      `)
    ).toBe(20)
  })

  test('expressions as keys', () => {
    expect(
      getOutput(
        `
        let value = fn(){"2"};
        let map = {"2": 10};
        map[value()]
      `
      )
    ).toBe(10)
  })

  test('values as functions', () => {
    expect(getOutput('{"a": fn(x){x*x}}["a"](10)')).toBe(100)
  })

  test('allows arbitrary objects as keys', () => {
    expect(getOutput('{"a": 1, 1: 2}["a"]')).toBe(1)
    expect(getOutput('{"a": 1, 1: 2}[1]')).toBe(2)
  })

  test('allows functions as keys', () => {
    expect(getOutput('{"a": 1, fn(x){x}: 2}["a"]')).toBe(1)
    expect(getOutput('let dummy = fn(){}; {"a": 1, dummy: 2}[dummy]')).toBe(2)
  })

  test('uses references for keys', () => {
    expect(getOutput('{"a": 1, fn(){}: 2}[fn(){}]')).toBe(null)
  })

  test('uses references for complex objects', () => {
    expect(
      getOutput(
        `
        let x = {"a": 1, "b": 2};
        let y = x;
        y["a"] = 10;
        x["a"]
      `
      )
    ).toBe(10)
    expect(
      getOutput(
        `
        let x = {"a": 1, "b": 2};
        let y = x;
        x = {"a": 10, "b": 20};
        y
      `
      )
    ).toStrictEqual(
      new DictionaryObject(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
    )
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

describe('return values are unwrapped', () => {
  test('with functions', () => {
    expect(getOutput('fn(x){return fn(y){return x+y;};}(10)(20);')).toBe(30)
  })
  test('with if else', () => {
    expect(
      getOutput(
        `
        let x = fn(){
          if(true){
            return 10;
          }
          return 20;
        };
        x()
      `
      )
    ).toBe(10)
  })
  test('with block expressions', () => {
    expect(
      getOutput(
        `
        let x = {
          return 10;
        };
        x
      `
      )
    ).toBe(10)
  })
  test('with while', () => {
    expect(
      getOutput(
        `
        let x = 1;
        while(x<10){
          x = x + 1;
          if(x==5){
            return x;
          }
        }
      `
      )
    ).toBe(5)
  })
})

describe('iterables', () => {
  test('work with positive indices', () => {
    expect(getOutput('[1, 2, 3][0]')).toBe(1)
    expect(getOutput('[1, 2, 3][1]')).toBe(2)
    expect(getOutput('[1, 2, 3][2]')).toBe(3)
    expect(getOutput('"abc"[0]')).toBe('a')
  })

  test('work with negative indices', () => {
    expect(getOutput('[1, 2, 3][-1]')).toBe(3)
    expect(getOutput('[1, 2, 3][-2]')).toBe(2)
    expect(getOutput('[1, 2, 3][-3]')).toBe(1)
    expect(getOutput('"abc"[-1]')).toBe('c')
  })

  test('throws error for out of bounds indices', () => {
    expect(() => getOutput('[1, 2, 3][3]')).toThrowError(
      IterableIndexOutOfBoundsError
    )
    expect(() => getOutput('[1, 2, 3][-4]')).toThrowError(
      IterableIndexOutOfBoundsError
    )
    expect(() => getOutput('"abc"[3]')).toThrowError(
      IterableIndexOutOfBoundsError
    )
    expect(() => getOutput('"abc"[-4]')).toThrowError(
      IterableIndexOutOfBoundsError
    )
  })
})

describe('numbers', () => {
  test('work with negative numbers', () => {
    expect(getOutput('-1')).toBe(-1)
    expect(getOutput('-1 + 2')).toBe(1)
    expect(getOutput('1 - 2')).toBe(-1)
    expect(getOutput('1 - -2')).toBe(3)
  })
  test('work with floating point numbers', () => {
    expect(getOutput('1.5')).toBe(1.5)
    expect(getOutput('1.5 + 2.5')).toBe(4)
    expect(getOutput('1.5 - 2.5')).toBe(-1)
    expect(getOutput('1.5 - -2.5')).toBe(4)
    expect(getOutput('0.1 + 0.2')).toBeCloseTo(0.3)
  })

  test('trailing zeros are optional', () => {
    expect(getOutput('1.')).toBe(1)
    expect(getOutput('1.0')).toBe(1)
    expect(getOutput('1.000')).toBe(1)
    expect(getOutput('let x = 1. + 3.3; x')).toBe(4.3)
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
    expect(() => getOutput('true / false')).toThrowError(TypeMismatchError)
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

  test('Variable not found', () => {
    expect(() => getOutput('x')).toThrowError(VariableNotFoundError)
    expect(() => getOutput('let x = 1; x + y')).toThrowError(
      VariableNotFoundError
    )
  })

  test('reports accurate line numbers', () => {
    try {
      getOutput('let x = 3')
    } catch (e: any) {
      expect(
        e.errors.join(' ').includes('expected ; but got EOF at line 1')
      ).toBeTruthy()
    }
    try {
      getOutput('let x = y;')
    } catch (e: any) {
      console.log(e)
      expect(e.message).toBe('Variable not found: y at line 1')
    }
  })
})
