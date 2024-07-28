import {
  BinaryExpression,
  Expression,
  IfElseExpression,
  LetStatement,
  ReturnStatement,
  ReturnValue,
  Statement,
  TokenType,
  UnaryExpression,
} from './types'
import { isTruthy } from './utils'

export class Evaluator {
  statements: Statement[]

  constructor(statements: Statement[]) {
    this.statements = statements
  }
  evaluate() {
    console.dir({ statements: this.statements }, { depth: null })
    return evaluateStatements(this.statements)
  }
}

const evaluateStatements = (statements: Statement[]) => {
  let result = null
  for (const statement of statements) {
    if (statement instanceof LetStatement) {
      // evaluateLetStatement(statement)
    } else if (statement instanceof ReturnStatement) {
      return evaluateExpression(statement.returnValue!)
    } else {
      result = evaluateExpression(statement)
      if (result instanceof ReturnValue) {
        return evaluateExpression(result.value)
      }
    }
  }
  return result
}

const evaluateExpression = (expression: Expression) => {
  if (expression instanceof BinaryExpression) {
    return evaluateBinaryExpression(expression)
  }
  if (expression instanceof UnaryExpression) {
    return evaluateUnaryExpression(expression)
  }
  if (expression instanceof IfElseExpression) {
    return evaluateIfElseExpression(expression)
  }
  if (expression.node.type === TokenType.INT) {
    return parseInt(expression.node.value!)
  }
  if (expression.node.type === TokenType.TRUE) {
    return true
  }
  if (expression.node.type === TokenType.FALSE) {
    return false
  }
}

const evaluateBinaryExpression = (
  expression: BinaryExpression
): number | boolean | null => {
  const left = evaluateExpression(expression.left)
  const right = evaluateExpression(expression.right)
  switch (expression.node.type) {
    case TokenType.PLUS:
      if (typeof left === 'number' && typeof right === 'number') {
        return left + right
      }
      return null
    case TokenType.MINUS:
      if (typeof left === 'number' && typeof right === 'number') {
        return left - right
      }
      return null
    case TokenType.ASTERISK:
      if (typeof left === 'number' && typeof right === 'number') {
        return left * right
      }
      return null
    case TokenType.SLASH:
      if (typeof left === 'number' && typeof right === 'number') {
        return left / right
      }
      return null
    case TokenType.LESS_THAN:
      if (typeof left === 'number' && typeof right === 'number') {
        return left < right
      }
      return null
    case TokenType.GREATER_THAN:
      if (typeof left === 'number' && typeof right === 'number') {
        return left > right
      }
      return null
    case TokenType.EQ:
      return left === right
    case TokenType.NOT_EQ:
      return left !== right
  }
  return null
}

const evaluateUnaryExpression = (
  expression: UnaryExpression
): number | boolean | null => {
  const right = evaluateExpression(expression.expression!)
  switch (expression.node.type) {
    case TokenType.MINUS:
      if (typeof right === 'number') {
        return -right
      }
      return null
    case TokenType.BANG:
      if (typeof right === 'boolean') {
        return !right
      }
      return null
  }
  return null
}

const evaluateIfElseExpression = (
  expression: IfElseExpression
): number | boolean | null | ReturnValue => {
  const condition = evaluateExpression(expression.condition!)
  if (isTruthy(condition)) {
    return evaluateBlockStatements(expression.consequence)!
  } else {
    return evaluateBlockStatements(expression.alternative)!
  }
}

const evaluateBlockStatements = (
  statements: Statement[]
): number | boolean | null | ReturnValue => {
  let result = null
  for (const statement of statements) {
    if (statement instanceof LetStatement) {
      // evaluateLetStatement(statement)
    } else if (statement instanceof ReturnStatement) {
      return new ReturnValue(statement.returnValue!)
    } else {
      result = evaluateExpression(statement)
      if (result instanceof ReturnValue) {
        return evaluateExpression(result.value)!
      }
    }
  }
  return result!
}
