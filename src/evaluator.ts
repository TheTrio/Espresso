import { TypeMismatchError, VariableNotFoundError } from './errors'
import { NOT_FOUND_IN_STORE, Store } from './store'
import {
  ArrayLiteralExpression,
  BinaryExpression,
  BlockExpression,
  DictionaryLiteralExpression,
  FunctionExpression,
  IfElseExpression,
  IndexExpression,
  UnaryExpression,
  WhileExpression,
} from './syntax/expressions'
import {
  ArrayObject,
  DictionaryObject,
  FunctionObject,
  NativeFunction,
} from './syntax/objects'
import {
  LetStatement,
  ReassignmentStatement,
  ReturnStatement,
} from './syntax/statements'
import { TokenType } from './syntax/token'
import { Expression, LValue, ReturnValue, Statement, Value } from './types'
import { isTruthy } from './utils'
import { FunctionCallExpression } from './syntax/expressions'

export class Evaluator {
  statements: Statement[]
  store: Store
  constructor(statements: Statement[], store: Store) {
    this.statements = statements
    this.store = store
  }
  evaluate() {
    return evaluateStatements(this.statements, this.store)
  }
}

const evaluateStatements = (statements: Statement[], store: Store) => {
  let result = undefined
  for (const statement of statements) {
    if (statement instanceof LetStatement) {
      evaluateLetStatement(statement, store)
      result = undefined
    } else if (statement instanceof ReassignmentStatement) {
      evaluateReassignmentStatement(statement, store)
      result = undefined
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
    const lvalue = statement.lvalue!
    let value
    if (lvalue instanceof IndexExpression) {
      value = getValueFromIndexExpression(lvalue, currentStore)
    } else {
      value = currentStore.getLocal(lvalue.value!)
    }
    if (value !== NOT_FOUND_IN_STORE) {
      setValueFromLValue(
        statement.lvalue!,
        currentStore,
        evaluateExpression(statement.rvalue!, store)
      )
      return
    }
    currentStore = currentStore.parentStore!
  }
}

const getValueFromLValue = (lvalue: LValue, store: Store) => {
  if (lvalue instanceof IndexExpression) {
    return getValueFromIndexExpression(lvalue, store)
  }

  const result = store.get(lvalue.value!)
  if (result === NOT_FOUND_IN_STORE) {
    throw new VariableNotFoundError(lvalue.value!)
  }
  return result
}

const getValueFromIndexExpression = (lvalue: IndexExpression, store: Store) => {
  const left: ArrayObject | DictionaryObject = evaluateExpression(
    lvalue.left,
    store
  )
  if (left instanceof ArrayObject) {
    return left.at(evaluateExpression(lvalue.index, store))
  } else if (left instanceof DictionaryObject) {
    return left.at(evaluateExpression(lvalue.index, store))
  }
}

const setValueFromLValue = (lvalue: LValue, store: Store, value: any) => {
  if (lvalue instanceof IndexExpression) {
    const left: ArrayObject | DictionaryObject = evaluateExpression(
      lvalue.left,
      store
    )
    if (left instanceof ArrayObject) {
      left.set(evaluateExpression(lvalue.index, store), value)
    } else if (left instanceof DictionaryObject) {
      left.set(evaluateExpression(lvalue.index, store), value)
    } else {
      throw new Error('Trying to index a indexable object')
    }
  } else {
    store.set(lvalue.value!, value)
  }
}

const evaluateLetStatement = (statement: LetStatement, store: Store) => {
  const value = evaluateExpression(statement.rvalue!, store)
  setValueFromLValue(statement.lvalue!, store, value)
}

const evaluateExpression = (
  expression: Expression | Value,
  store: Store
): any => {
  if (expression === null) {
    return null
  }

  switch (typeof expression) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return expression
  }

  if (expression instanceof ArrayLiteralExpression) {
    return new ArrayObject(
      expression.elements.map((e) => evaluateExpression(e, store))
    )
  }

  if (expression instanceof DictionaryLiteralExpression) {
    const newMap = new Map()
    expression.elements.forEach((value, key) => {
      newMap.set(key, evaluateExpression(value, store))
    })
    return new DictionaryObject(newMap)
  }

  if (expression instanceof IndexExpression) {
    const left: ArrayObject | DictionaryObject = evaluateExpression(
      expression.left,
      store
    )
    if (left instanceof ArrayObject) {
      return left.at(evaluateExpression(expression.index, store))
    } else if (left instanceof DictionaryObject) {
      return left.at(evaluateExpression(expression.index, store))
    } else {
      throw new Error('Trying to index a non-indexable object')
    }
  }

  if (expression instanceof BinaryExpression) {
    return evaluateBinaryExpression(expression, store)
  }

  if (expression instanceof UnaryExpression) {
    return evaluateUnaryExpression(expression, store)
  }

  if (expression instanceof IfElseExpression) {
    const blockStore = new Store(store)
    const result = evaluateIfElseExpression(expression, blockStore)
    if (result instanceof ReturnValue) {
      return new ReturnValue(evaluateExpression(result.value, blockStore))
    }
    return result
  }

  if (expression instanceof BlockExpression) {
    const blockStore = new Store(store)
    return extractReturnValue(
      evaluateBlockStatements(expression.statements, blockStore)!,
      blockStore
    )!
  }

  if (expression instanceof WhileExpression) {
    let result
    const blockStore = new Store(store)
    while (isTruthy(evaluateExpression(expression.condition!, blockStore))) {
      result = evaluateBlockStatements(expression.body, blockStore)
      if (result instanceof ReturnValue) {
        return new ReturnValue(evaluateExpression(result.value, blockStore))
      }
    }
    return result
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
    return getValueFromLValue(expression.node, store)
  }
}

const evaluateFunctionCallExpression: any = (
  expression: FunctionCallExpression,
  store: Store
) => {
  let funcObject: FunctionObject
  if (
    expression.function instanceof FunctionCallExpression ||
    expression.function instanceof FunctionExpression ||
    expression.function instanceof IndexExpression ||
    expression.function instanceof IfElseExpression ||
    expression.function instanceof WhileExpression
  ) {
    funcObject = evaluateExpression(expression.function, store)
  } else {
    funcObject = store.get(expression.function.node.value!)
  }
  if (
    !(funcObject instanceof NativeFunction) &&
    funcObject.parameters.length !== expression.parameters.length
  ) {
    throw new Error(
      `Expected ${funcObject.parameters.length} arguments, got ${expression.parameters.length}`
    )
  }
  return evaluateFunction(funcObject, store, expression)
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
  value: number | boolean | null | ReturnValue | FunctionObject | string,
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
): number | boolean | string | undefined => {
  const left = evaluateExpression(expression.left, store)
  const right = evaluateExpression(expression.right, store)

  switch (expression.node.type) {
    case TokenType.PLUS:
      if (typeof left === 'number' && typeof right === 'number') {
        return left + right
      }
      if (typeof left === 'string' && typeof right === 'string') {
        return left + right
      }

      if (typeof left === 'string' && typeof right === 'number') {
        return left + right
      }

      if (typeof left === 'number' && typeof right === 'string') {
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
  throw new Error('Unknown binary expression')
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
  throw new Error('Unknown unary expression')
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
      result = undefined
    } else if (statement instanceof ReassignmentStatement) {
      evaluateReassignmentStatement(statement, store)
      result = undefined
    } else if (statement instanceof ReturnStatement) {
      return new ReturnValue(statement.returnValue!)
    } else {
      result = evaluateExpression(statement, store)
      if (result instanceof ReturnValue) {
        return result
      }
    }
  }
  return result!
}
