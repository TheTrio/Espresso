import { IndexExpression } from './syntax/expressions'
import { Token } from './syntax/token'

export interface Statement {
  node: Token
}

export interface Expression {
  node: Token
}

export type LValue = Token | IndexExpression

export abstract class IterableObject {
  abstract _length(): number
}

export type Value = string | number | boolean | null | undefined

export class ReturnValue {
  value: Expression | Value

  constructor(value: Expression) {
    this.value = value
  }
}

export interface Object {
  asString: () => string
}
