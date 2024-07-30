# Espresso

A high level interpreted language based on expressions. Built from scratch in Typescript.

Some of its features are

- Dynamic typing
- Interpreted
- First class functions
- Garbage Collected
- Expressions everywhere
- Blocks!

This goes without saying, but this is not a language for serious use.

It's based off of the Monkey language from the book [Writing an Interpreter in Go](https://interpreterbook.com/). I highly recommend it if you're interested in building your own language. I deviated from the book after the first couple of chapters, but the core ideas are the same.

## Installation

You can run the repl by cloning the repository and running

```bash
git clone https://github.com/TheTrio/Espresso
cd Espresso
pnpm install
pnpm repl
```

In the REPL, you can type `.editor` to enter multiline mode. Then you can type your code and press `Ctrl + D` to run it.

Or you can run single line code by typing it directly.

```bash
$ pnpm repl

> @ repl /Users/shashwat/Code/Espresso
> tsc && node dist/src/repl.js
> .editor
// Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
if(true){
  "true"
}else{
  "false"
}
// press Ctrl + D
true
```

```bash
$ pnpm repl

> @ repl /Users/shashwat/Code/Espresso
> tsc && node dist/src/repl.js

> let word = "hello";
undefined
> word + " world"
hello world

```

## Usage

### Variables

Variables are declared with the `let` keyword.

```js
let a = 10;
let b = 20;
a + b; // 30
```

There are currently 4 types of values: `number`, `boolean`, `string` and `null`. This is excluding functions.

You can also mutate already declared variables.

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
b // undefined
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
type // 10
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
print(a); // undefined
```

Same is true for functions, loops and conditionals.

```js
let age = 22;
if(age > 18){
  let adult = true;
}
print(adult); // undefined
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

### Comments

Comments start with `//` and go until the end of the line.

```js
// This is a comment
let a = 10; // This is also a comment
```

### Built-in functions

Espresso comes with a few built-in functions.

- `len`: Returns the length of a string or an array.
- `print`: Prints a value to the console.

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
