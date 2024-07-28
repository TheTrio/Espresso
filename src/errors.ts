export class TypeMismatchError extends Error {
  constructor(operator: string, got_1: string, got_2: string) {
    super(
      `Type mismatch: ${got_1.toUpperCase()} ${operator} ${got_2.toUpperCase()}`
    )
  }
}
