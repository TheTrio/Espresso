let apply = fn(f, a, b) {
  return f(a, b);
};

print(apply(fn(a, b) { a + b; }, 10, 20));
