let makeAdder = fn(a) {
  return fn(b) {
    return a + b;
  };
};

let add10 = makeAdder(10);
print(add10(20));
