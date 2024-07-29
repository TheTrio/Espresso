import { TypeMismatchError, VariableNotFoundError } from './errors'
import { Store } from './store'
import {
  BinaryExpression,
  BlockExpression,
  Expression,
  FunctionCallExpression,
  FunctionExpression,
  FunctionObject,
  IfElseExpression,
  LetStatement,
  NativeFunction,
  ReassignmentStatement,
  ReturnStatement,
  ReturnValue,
  Statement,
  TokenType,
  UnaryExpression,
} from './types'
import { isTruthy } from './utils'

export class Evaluator {
  statements: Statement[]
  store: Store
  constructor(statements: Statement[], store: Store) {
    this.statements = statements
    this.store = store
  }
  evaluate() {
    const result = evaluateStatements(this.statements, this.store)
    if (result?.asString) {
      return result.asString()
    } else {
      return result
    }
  }
}

const evaluateStatements = (statements: Statement[], store: Store) => {
  let result = undefined
  for (const statement of statements) {
    if (statement instanceof LetStatement) {
      evaluateLetStatement(statement, store)
    } else if (statement instanceof ReassignmentStatement) {
      evaluateReassignmentStatement(statement, store)
    } else if (statement instanceof ReturnStatement) {
      return evaluateExpression(statement.returnValue!, store)
    } else {
      result = evaluateExpression(statement, store)
      if (result instanceof ReturnValue) {
        return evaluateExpression(result.value, store)
      }
    }
  }
  return result
}

const evaluateReassignmentStatement = (
  statement: LetStatement,
  store: Store
) => {
  let currentStore = store
  while (currentStore) {
    if (currentStore.data.has(statement.lvalue!.value!)) {
      const value = evaluateExpression(statement.rvalue!, currentStore)
      currentStore.set(statement.lvalue!.value!, value)
      return
    }
    currentStore = currentStore.parentStore!
  }
  throw new VariableNotFoundError(statement.lvalue!.value!)
}

const evaluateLetStatement = (statement: LetStatement, store: Store) => {
  const value = evaluateExpression(statement.rvalue!, store)
  store.set(statement.lvalue!.value!, value)
}

const evaluateExpression = (expression: Expression, store: Store) => {
  if (expression instanceof BinaryExpression) {
    return evaluateBinaryExpression(expression, store)
  }
  if (expression instanceof UnaryExpression) {
    return evaluateUnaryExpression(expression, store)
  }
  if (expression instanceof IfElseExpression) {
    return evaluateIfElseExpression(expression, store)
  }
  if (expression instanceof BlockExpression) {
    const blockStore = new Store(store)
    return extractReturnValue(
      evaluateBlockStatements(expression.statements, blockStore)!,
      blockStore
    )
  }

  if (expression instanceof FunctionExpression) {
    return evaluateFunctionExpression(expression, store)
  }

  if (expression instanceof FunctionCallExpression) {
    return evaluateFunctionCallExpression(expression, store)
  }

  if (expression.node.type === TokenType.INT) {
    return parseInt(expression.node.value!)
  }

  if (expression.node.type === TokenType.QUOTE) {
    return expression.node.value
  }

  if (expression.node.type === TokenType.TRUE) {
    return true
  }
  if (expression.node.type === TokenType.FALSE) {
    return false
  }
  if (expression.node.type === TokenType.NULL) {
    return null
  }
  if (expression.node.type === TokenType.IDENT) {
    return store.get(expression.node.value!)
  }
}

const evaluateFunctionCallExpression: any = (
  expression: FunctionCallExpression,
  store: Store
) => {
  if (
    expression.function instanceof FunctionCallExpression ||
    expression.function instanceof FunctionExpression
  ) {
    return evaluateFunction(
      evaluateExpression(expression.function, store),
      store,
      expression
    )
  } else {
    const funcObject = store.get(expression.function.node.value!)
    return evaluateFunction(funcObject, store, expression)
  }
}

const evaluateFunction = (
  func: FunctionObject,
  store: Store,
  expression: FunctionCallExpression
) => {
  if (!(func instanceof FunctionObject)) {
    throw new Error('Trying to call a non-function object')
  }
  const evaluatedArgs = expression.parameters.map((arg) =>
    evaluateExpression(arg, store)
  )
  if (func instanceof NativeFunction) {
    return func.fn(...evaluatedArgs)
  }
  const newStore = new Store(func.store)
  func.parameters.forEach((param, i) => {
    newStore.set(param.value!, evaluatedArgs[i])
  })
  return extractReturnValue(
    evaluateBlockStatements(func.body, newStore)!,
    newStore
  )
}

const evaluateFunctionExpression = (
  expression: FunctionExpression,
  store: Store
) => {
  return new FunctionObject(expression.parameters, expression.body, store)
}

const extractReturnValue = (
  value: number | boolean | null | ReturnValue | FunctionObject,
  newStore: Store
) => {
  let curr = value
  while (curr instanceof ReturnValue) {
    curr = evaluateExpression(curr.value, newStore)!
  }
  return curr
}

const evaluateBinaryExpression = (
  expression: BinaryExpression,
  store: Store
): number | boolean | undefined => {
  const left = evaluateExpression(expression.left, store)
  const right = evaluateExpression(expression.right, store)
  switch (expression.node.type) {
    case TokenType.PLUS:
      if (typeof left === 'number' && typeof right === 'number') {
        return left + right
      }
      throw new TypeMismatchError(TokenType.PLUS, typeof left, typeof right)
    case TokenType.MINUS:
      if (typeof left === 'number' && typeof right === 'number') {
        return left - right
      }
      throw new TypeMismatchError(TokenType.MINUS, typeof left, typeof right)
    case TokenType.ASTERISK:
      if (typeof left === 'number' && typeof right === 'number') {
        return left * right
      }
      throw new TypeMismatchError(TokenType.ASTERISK, typeof left, typeof right)
    case TokenType.SLASH:
      if (typeof left === 'number' && typeof right === 'number') {
        return left / right
      }
      throw new TypeMismatchError(TokenType.SLASH, typeof left, typeof right)
    case TokenType.LESS_THAN:
      if (typeof left === 'number' && typeof right === 'number') {
        return left < right
      }
      throw new TypeMismatchError(
        TokenType.LESS_THAN,
        typeof left,
        typeof right
      )
    case TokenType.GREATER_THAN:
      if (typeof left === 'number' && typeof right === 'number') {
        return left > right
      }
      throw new TypeMismatchError(
        TokenType.GREATER_THAN,
        typeof left,
        typeof right
      )
    case TokenType.LESS_THAN_EQ:
      if (typeof left === 'number' && typeof right === 'number') {
        return left <= right
      }
      throw new TypeMismatchError(
        TokenType.LESS_THAN_EQ,
        typeof left,
        typeof right
      )
    case TokenType.GREATER_THAN_EQ:
      if (typeof left === 'number' && typeof right === 'number') {
        return left >= right
      }
      throw new TypeMismatchError(
        TokenType.GREATER_THAN_EQ,
        typeof left,
        typeof right
      )
    case TokenType.EQ:
      if (typeof left === typeof right) {
        return left === right
      }
      throw new TypeMismatchError(TokenType.EQ, typeof left, typeof right)
    case TokenType.NOT_EQ:
      if (typeof left === typeof right) {
        return left !== right
      }
      throw new TypeMismatchError(TokenType.NOT_EQ, typeof left, typeof right)
  }
}

const evaluateUnaryExpression = (
  expression: UnaryExpression,
  store: Store
): number | boolean | undefined => {
  const right = evaluateExpression(expression.expression!, store)
  switch (expression.node.type) {
    case TokenType.MINUS:
      if (typeof right === 'number') {
        return -right
      }
      break
    case TokenType.BANG:
      if (typeof right === 'boolean') {
        return !right
      }
      break
  }
}

const evaluateIfElseExpression = (
  expression: IfElseExpression,
  store: Store
): number | boolean | null | ReturnValue => {
  const condition = evaluateExpression(expression.condition!, store)
  if (isTruthy(condition)) {
    return evaluateBlockStatements(expression.consequence, store)!
  } else {
    return evaluateBlockStatements(expression.alternative, store)!
  }
}

const evaluateBlockStatements = (
  statements: Statement[],
  store: Store
): number | boolean | ReturnValue | undefined => {
  let result = undefined
  for (const statement of statements) {
    if (statement instanceof LetStatement) {
      evaluateLetStatement(statement, store)!
    } else if (statement instanceof ReassignmentStatement) {
      evaluateReassignmentStatement(statement, store)
    } else if (statement instanceof ReturnStatement) {
      return new ReturnValue(statement.returnValue!)
    } else {
      result = evaluateExpression(statement, store)
      if (result instanceof ReturnValue) {
        return evaluateExpression(result.value, store)!
      }
    }
  }
  return result!
}
