import { Expression, LValue, Statement } from '../types'
import { TokenType } from './token'

export class LetStatement implements Statement {
  node = {
    type: TokenType.LET,
  }
  lvalue: LValue | null = null
  rvalue: Expression | null = null

  constructor(lvalue?: LValue, rvalue?: Expression) {
    this.lvalue = lvalue || null
    this.rvalue = rvalue || null
  }
}

export class ReassignmentStatement implements Statement {
  node = {
    type: TokenType.LET,
  }
  lvalue: LValue | null = null
  rvalue: Expression | null = null

  constructor(lvalue?: LValue, rvalue?: Expression) {
    this.lvalue = lvalue || null
    this.rvalue = rvalue || null
  }
}

export class ReturnStatement implements Statement {
  node = {
    type: TokenType.RETURN,
  }
  returnValue: Expression | null = null

  constructor(returnValue?: Expression | null) {
    this.returnValue = returnValue || null
  }
}
