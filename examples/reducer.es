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

print(sum);
