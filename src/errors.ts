export class TypeMismatchError extends Error {
  constructor(operator: string, got_1: string, got_2: string) {
    super(
      `Type mismatch: ${got_1.toUpperCase()} ${operator} ${got_2.toUpperCase()}`
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
