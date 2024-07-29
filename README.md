# Espresso

A high level interpreted language based on expressions. Built from scratch in Typescript.

Some of its features are

- Dynamic typing
- Interpreted
- First class functions
- Garbage Collected
- Expressions everywhere
- Blocks!

This goes without saying, but this is a toy language. It's based off of the Monkey language from the book [Writing an Interpreter in Go](https://interpreterbook.com/). I've added some features and changed some things around, but the core of the language is the same and I highly recommend reading the book if you're interested in compilers and interpreters.

## Usage

### Variables

Variables are declared with the `let` keyword.

```js
let a = 10;
let b = 20;
a + b; // 30
```

There are currently 2 types of variables: `number` and `boolean`.

You can mutate variables.

```js
let a = 10;
a = 20;
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

Note that the `return` keyword is optional. If you don't use it, the last expression in the block will be returned. This is useful for short functions.

```js
let max = fn(a, b) {
  if (a > b) {
    a
  } else {
    b
  }
};
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
b // undefined
```

### Conditionals

You can use the `if` keyword to create conditionals.

```js
let a = 10;
if (a > 5) {
  a
} else {
  0
}
```

`if` blocks are expressions too. They can have an optional `else` block

```js
let a = 10;
let b = if (a > 5) {
  a; // or return a;
} else {
  0
};
b // 10
```
