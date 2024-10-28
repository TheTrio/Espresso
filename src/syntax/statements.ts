import { Expression, LValue, Statement } from '../types'
import { Token, TokenType } from './token'

export class LetStatement implements Statement {
  lvalue: LValue | null = null
  rvalue: Expression | null = null
  node: Token

  constructor(token: Token, lvalue?: LValue, rvalue?: Expression) {
    this.node = token
    this.lvalue = lvalue || null
    this.rvalue = rvalue || null
  }
}

export class ReassignmentStatement implements Statement {
  node: Token
  lvalue: LValue | null = null
  rvalue: Expression | null = null

  constructor(token: Token, lvalue?: LValue, rvalue?: Expression) {
    this.node = token
    this.lvalue = lvalue || null
    this.rvalue = rvalue || null
  }
}

export class ReturnStatement implements Statement {
  node: Token
  returnValue: Expression | null = null

  constructor(token: Token, returnValue?: Expression | null) {
    this.node = token
    this.returnValue = returnValue || null
  }
}
