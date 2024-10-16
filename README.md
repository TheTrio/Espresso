# Espresso

A high level interpreted language based on expressions. Built from scratch in Typescript.

Named after the the [song](https://www.youtube.com/watch?v=eVli-tstM5E) by Sabrina Carpenter. And because — expressions. One of those is more important than the other. And its not the latter :-)

Some of its features are

- Dynamic typing
- Interpreted
- First class functions
- Garbage Collected
- Expressions everywhere
- Blocks!

The language is based off of the Monkey language from the book [Writing an Interpreter in Go](https://interpreterbook.com/). I highly recommend it if you're interested in building your own language. I deviated from the book after the first couple of chapters so the final result looks quite different, but the core ideas are the same.

## Usage

0. [Installation](#installation)
1. [Variables](#variables)
2. [Arrays](#arrays)
3. [Dictionaries](#dictionaries)
4. [Strings](#strings)
5. [Functions](#functions)
6. [Blocks](#blocks)
7. [Conditionals](#conditionals)
8. [Loops](#loops)
9. [Scoping](#scoping)
10. [Returning values](#returning-values)
11. [Object Oriented Programming](#object-oriented-programming)
12. [Comments](#comments)
13. [Built-in functions](#built-in-functions)
14. [Examples](#examples)

## Installation

You can install the interpreter from NPM

```bash
> npm install -g espressolang
```

You can execute espresso files by passing the file path as an argument. The examples folder contains a few example programs.

```bash
> espressolang examples/OOP.es
```

Or you can get to the REPL by running `espresslang` without any arguments.

```bash
> espressolang

> let word = "hello";
undefined
> word + " world"
hello world
```

### Variables

Variables are declared with the `let` keyword.

```js
let a = 10;
let b = 20;
a + b; // 30
```

There are currently 8 types of values: `number`, `boolean`, `string`, `array`, `null`, `undefined`, `dictionaries` , and `function`.

_**Note**_: Arrays, Dictionaries and Functions  are stored as references, while the rest are primitive values.

```js
print(10==10) // true
print([1]==[1]) // false
```

You can mutate already declared variables.

```js
let a = 10;
a = 20;
```

Using let on an already declared variable works, but do keep in mind if the variable was in the global scope, it will be shadowed.

```js
let a = 10;
{
  let a = 20;
  print(a); // 20
}
print(a); // 10
```

This is in contrast to simply using the `=` operator, which will mutate the variable in the scope it was declared in.

```js
let a = 10;
{
  a = 20;
  print(a); // 20
}
print(a); // 20
```

### Arrays

Arrays are declared with square brackets `[]`.

```js
let a = [1, 2, 3];
push(a, 4);
a; // [1, 2, 3, 4]
```

You can access and mutate elements in an array using square brackets.

```js
let a = [1, 2, 3];
a[0]; // 1
a[0] = 10;
a; // [10, 2, 3]
```

There is no restriction on the type of elements in an array.

```js
let a = [1, "hello", true, [1, 2, 3], fn(x){ return x*x; }];
print(a[4](10)); // 100
print(a[1] + " world"); // hello world
```

Similar to other languages, arrays are references. This means that if you assign an array to another variable, both variables will point to the same array.

```js
let a = [1, 2, 3];
let b = a;
b[0] = 10;
a; // [10, 2, 3]
```

### Strings

Strings are declared with double quotes `""`.

```js
let a = "hello";
let b = "world";
a + " " + b; // hello world
```

You can access characters in a string using square brackets.

```js
let a = "hello";
print("I like to " + a[1] + "at");// I like to eat
```

However, strings are immutable. This means that you can't change a character in a string.

```js
let a = "hello";
a[0] = "H"; // This will throw an error
```

### Dictionaries

Similar to other programming languages, Espresso supports key value pairs via dictionaries.

```js
let a = {"name": "Shashwat", "age": 22};
a["name"]; // Shashwat
a["age"] = 18;
a["age"]; // 18
```

Similar to arrays, the values in a dictionary can be of any type.

```js
let a = {"name": "Shashwat", "age": 22, "func": fn(x){ return x*x; }};
a["func"](10); // 100
```

However, the keys in a dictionary can only be strings.

```js
let a = {1: "hello"}; // This will throw an error
```

To create an empty dictionary, you can use the `dict` function. `{}` will be treated as an empty block(which evaluates to `undefined`).

```js
let a = dict();
let b = {};
b // undefined
```

### Functions

Functions can be declared with the `fn` keyword. Like everything else in Espresso, functions are expressions.

This means they can be assigned to variables.

```js
let add = fn(a, b) {
  return a + b;
};

add(10, 20); // 30
```

Passed to other functions.

```js
let apply = fn(f, a, b) {
  return f(a, b);
};

let add = fn(a, b) {
  return a + b;
};

apply(add, 10, 20); // 30
```

And even returned from other functions.

```js
let makeAdder = fn(a) {
  return fn(b) {
    return a + b;
  };
};

let add10 = makeAdder(10);
add10(20); // 30
```

They also close over their environment.

```js
let makeCounter = fn() {
  let count = 0;
  return fn() {
    count = count + 1;
    return count;
  };
};

let counter = makeCounter();
counter(); // 1
counter(); // 2
```

Since functions are expressions, you can also have anonymous lambda functions.

```js
let apply = fn(f, a, b) {
  return f(a, b);
};

apply(fn(a, b) { a + b; }, 10, 20); // 30
```

### Blocks

Blocks are a sequence of statements enclosed in curly braces `{}`. They are used to group statements together.

And yes, blocks are expressions too.

```js
let a = {
  let b = 10;
  let c = 20;
  b + c
};
a // 30
```

Variables declared inside a block are only available inside that block.

```js
let a = {
  let b = 10;
  b
};
b // throws an error
```

### Conditionals

You can use the `if` keyword to create conditionals.

```js
let name = "Shashwat";
if (name == "Shashwat") {
  "Hello Shashwat!"
} else {
  "Hello stranger!"
}
```

`if` blocks are expressions too. They can have an optional `else` block

```js
let age = 22;
let type = if (age > 18) {
  "adult"
} else {
  "minor"
};
type // adult
```

### Loops

Espresso supports the traditional `while` loop.

```js
let i = 0;
while (i < 10) {
  print(i);
  i = i + 1;
}
```

Unlike other languages however, `while` loops in Espresso are expressions.

```js
let i = 1;
let ans = while (i <=10) {
  i = i + 1;
  if (i == 5) {
    return "done"; // This will break the loop and return "done" to the variable ans
  }
  i 
};
ans // done
```

### Scoping

Espresso has block scoping. This means that variables declared inside a block are only available inside that block.

```js
{
  let a = 20;
  print(a); // 20
}
print(a); // throws an error
```

Same is true for functions, loops and conditionals.

```js
let age = 22;
if(age > 18){
  let adult = true;
}
print(adult); // throws an error
```

### Returning values

You can use the `return` keyword anywhere in the program. This will stop the execution of the current block and return the value.

```js
let a = 10;
let b = 20;
return a + b; // 30
a / b; // This will not be executed
```

Of course, you can also return from functions.

```js
let fib = fn(n){
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}
```

Note that you can make do without the  `return` keyword in some cases.

If you don't use it, the last expression in the block will be returned. This is useful for short functions.

```js
let max = fn(a, b) {
  if (a > b) {
    a
  } else {
    b
  }
};
```

While all that sounds simple, there are a few things to keep in mind.

One, returning from a block moves control over to the nearest block up the chain that can catch the returning value. This means that the following code doesn't do what you might expect.

```js
let func = fn(){
  let count = 1;
  let lastVal = while(count <= 10){
    count = count + 1;
    if(count == 5){
      return count; // This will break the loop and return 5 to the variable lastVal
    }
    count
  };
  return "sad";
};
```

What do you think the value of `func()` will be?

Unlike other languages where this would evaluate to `5`, in Espresso this will evaluate to `"sad"`. This is because the `return` statement breaks out of the loop and returns to the first block that catches its return value.

Unlike other languages, the `return` statement is not specific to a function. It can be used anywhere in the program to return from the current block.

You might be wondering why I chose to implement it this way. The reason is that since all blocks are expressions, it would be inconsistent to have the `return` statement behave differently.

The `return` statement is meant to return a value from the current block, and that's what it does.

This also means there's no need for a `break` statement. You can use `return` to break out of a loop.

While this might look like a limitation at first, it's actually not that big of a deal. This is because `return` statements do bubble up, waiting to be caught by the first block that can handle them.

For example, the above code can be made to behave as expected by removing the `let` statement which was catching the return value. This way, the return value will bubble up to the function block.

```js
let func = fn(){
  let count = 1;
  while(count < 10){
    count = count + 1;
    if(count == 5){
      return count; // This will break the loop and end the function, returning 5
    }
  };
  return "sad";
};
```

Now the value of `func()` will be `5`, as expected.

### Object Oriented Programming

Espresso doesn't support object oriented programming. However, you can pretty much get all the way there by using dictionaries and functions.

```ts
let Person = fn(name, age) {
  let person = {
    "name": name,
    "age": age,
    "greet": fn() {
      print("Hello, my name is " + person["name"] + " and I am " + person["age"] + " years old.");
    },
    "birthday": fn() {
      person["age"] = person["age"] + 1;
    }
  };
  return person;
};

let john = Person("John", 30);
let jane = Person("Jane", 25);

john["greet"](); // Output: Hello, my name is John and I am 30 years old.
jane["greet"](); // Output: Hello, my name is Jane and I am 25 years old.
john["birthday"]();
john["greet"](); // Output: Hello, my name is John and I am 31 years old.
```

Behold, the power of first class functions, closures and dictionaries. Its [functions all the way down](https://en.wikipedia.org/wiki/Turtles_all_the_way_down).

### Comments

Comments start with `//` and go until the end of the line.

```js
// This is a comment
let a = 10; // This is also a comment
```

### Built-in functions

Espresso comes with a few built-in functions.

- `len`: Returns the length of any iterable.
- `print`: Prints a value to the console.
- `push`: Pushes a value to the end of an array.
- `pop`: Pops a value from the end of an array by default. Takes an optional index to pop from that instead.
- `dict`: Creates an empty dictionary.
- `str`: Converts a value to a string.

```js
let count = len("hello"); // 5
print("hello", count, "world"); // hello 5 world
```

These functions are also first class values, so you can pass them around like any other function.

```js
let myPrint = print;
myPrint("hello"); // hello
```

It's also important to note that these aren't reserved keywords. You can override them if you want.

```js
{
  // this causes you to lose the len function in this block
  let len = fn(a) {
    return 10;
  };
  print(len("hello")); // 10
}
print(len("hello")); // 5
```

### Examples

That's a lot of information to take in. Here are a few examples to help you get started.

Let's implement the solution to the classic Two Sum problem.

```js
let twoSum = fn(nums, target) {
  let map = dict(); 
  let len = len(nums);
  let i = 0;
  
  while (i < len) {
    let num = nums[i];
    let diff = target - num;
    if (map[str(diff)] != null) {
      return [map[str(diff)], i]; 
    }
    map[str(num)] = i; 
    i = i + 1;
  }
  return null;
};

let nums = [2, 7, 11, 15];
let target = 9;
twoSum(nums, target); // Output: [0, 1]
```

We can also implement a simple recursive function to calculate the factorial of a number.

```js
let factorial = fn(n) {
  if (n == 0) {
    return 1;
  }
  return n * factorial(n - 1);
};

factorial(5); // Output: 120
```

How about a reducer function?

```js
let reduce = fn(arr, f, init) {
  let result = init;
  let len = len(arr);
  let i = 0;
  
  while (i < len) {
    result = f(result, arr[i]);
    i = i + 1;
  }
  return result;
};

let sum = reduce([1, 2, 3, 4], fn(acc, val) { acc + val; }, 0);
sum; // Output: 10
```

As you can see, despite the language being quite simple, you can still do quite a lot with it.
