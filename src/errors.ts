export class TypeMismatchError extends Error {
  constructor(operator: string, got_1: string, got_2: string, line: number) {
    super(
      `Type mismatch: ${got_1.toUpperCase()} ${operator} ${got_2.toUpperCase()} at line ${line}`
    )
  }
}

export class SyntaxError extends Error {
  errors: any[]
  constructor(errors: any[]) {
    super(`Syntax Error while parsing`)
    this.errors = errors
  }
}

export class IllegalTokenError extends Error {
  constructor(token: string) {
    super(`Illegal token: ${token}`)
  }
}

export class VariableNotFoundError extends Error {
  constructor(name: string, line: number) {
    super(`Variable not found: ${name} at line ${line}`)
  }
}

export class IterableIndexOutOfBoundsError extends Error {
  constructor(index: number, length: number) {
    super(`Iterable index out of bounds: ${index} (length: ${length})`)
  }
}
