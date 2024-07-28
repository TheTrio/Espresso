export type Token = {
  type: TokenType
  value?: string
}

export enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',

  IDENT = 'IDENT',
  INT = 'INT',

  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  SLASH = '/',
  ASTERISK = '*',
  LESS_THAN = '<',
  GREATER_THAN = '>',
  EQ = '==',
  NOT_EQ = '!=',

  BANG = '!',
  COMMA = ',',
  SEMICOLON = ';',
  LEFT_PAREN = '(',
  RIGHT_PAREN = ')',
  LBRACE = '{',
  RBRACE = '}',

  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
}

export enum Keyword {
  fn = 'FUNCTION',
  let = 'LET',
  true = 'TRUE',
  false = 'FALSE',
  if = 'IF',
  else = 'ELSE',
  return = 'RETURN',
}

export interface Statement {
  node: Token
}

export interface Expression {
  node: Token
}
export class BlockExpression implements Expression {
  node = {
    type: TokenType.LBRACE,
  }
  statements: Statement[] = []

  constructor(statements: Statement[]) {
    this.statements = statements
  }
}
export class LetStatement implements Statement {
  node = {
    type: TokenType.LET,
  }
  lvalue: Token | null = null
  rvalue: Expression | null = null

  constructor(lvalue?: Token, rvalue?: Expression) {
    this.lvalue = lvalue || null
    this.rvalue = rvalue || null
  }
}

export class ReturnStatement implements Statement {
  node = {
    type: TokenType.RETURN,
  }
  returnValue: Expression | null = null

  constructor(returnValue?: Expression) {
    this.returnValue = returnValue || null
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

export class UnaryExpression implements Expression {
  node: Token
  expression: Expression | null

  constructor(node: Token, expression: Expression | null) {
    this.node = node
    this.expression = expression
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

  constructor(parameters: Expression[], node: Token) {
    this.parameters = parameters
    this.node = node
  }
}

export class ReturnValue {
  value: Expression

  constructor(value: Expression) {
    this.value = value
  }
}
