import { Expression, Statement } from '../types'
import { Token, TokenType } from './token'

export class BlockExpression implements Expression {
  node: Token
  statements: Statement[] = []

  constructor(token: Token, statements: Statement[]) {
    this.node = token
    this.statements = statements
  }
}

export class BinaryExpression implements Expression {
  node: Token
  left: Expression
  right: Expression

  constructor(node: Token, left: Expression, right: Expression) {
    this.node = node
    this.left = left
    this.right = right
  }
}

export class IndexExpression implements Expression {
  node: Token
  left: Expression
  index: Expression

  constructor(token: Token, left: Expression, index: Expression) {
    this.node = token
    this.left = left
    this.index = index
  }
}

export class UnaryExpression implements Expression {
  node: Token
  expression: Expression | null

  constructor(node: Token, expression: Expression | null) {
    this.node = node
    this.expression = expression
  }
}

export class WhileExpression implements Expression {
  node: Token
  condition: Expression | null
  body: Statement[] = []

  constructor(node: Token, condition: Expression | null, body: Statement[]) {
    this.node = node
    this.condition = condition
    this.body = body
  }
}

export class IfElseExpression implements Expression {
  node: Token
  condition: Expression | null
  consequence: Statement[] = []
  alternative: Statement[] = []

  constructor(
    node: Token,
    condition: Expression | null,
    consequence: Statement[],
    alternative: Statement[]
  ) {
    this.node = node
    this.condition = condition
    this.consequence = consequence
    this.alternative = alternative
  }
}

export class FunctionExpression implements Expression {
  parameters: Token[] = []
  body: Statement[] = []
  node: Token

  constructor(parameters: Token[], body: Statement[], node: Token) {
    this.parameters = parameters
    this.body = body
    this.node = node
  }
}

export class FunctionCallExpression implements Expression {
  parameters: Expression[] = []
  node: Token
  function: Expression

  constructor(
    parameters: Expression[],
    node: Token,
    functionExpression: Expression
  ) {
    this.parameters = parameters
    this.node = node
    this.function = functionExpression
  }
}

export class ArrayLiteralExpression implements Expression {
  elements: Expression[] = []
  node: Token

  constructor(elements: Expression[], node: Token) {
    this.elements = elements
    this.node = node
  }
}

export class DictionaryLiteralExpression implements Expression {
  elements: Map<Expression, Expression> = new Map()
  node: Token

  constructor(elements: { key: Expression; value: Expression }[], node: Token) {
    elements.forEach(({ key, value }) => {
      this.elements.set(key, value)
    })
    this.node = node
  }
}
