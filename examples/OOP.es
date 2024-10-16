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