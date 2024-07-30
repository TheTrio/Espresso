import { Store } from './store'

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
  LESS_THAN_EQ = '<=',
  GREATER_THAN_EQ = '>=',
  EQ = '==',
  NOT_EQ = '!=',

  BANG = '!',
  COMMA = ',',
  SEMICOLON = ';',
  LEFT_PAREN = '(',
  RIGHT_PAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  QUOTE = '"',
  LBRACKET = '[',
  RBRACKET = ']',
  INDEX = 'INDEX',
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
  NULL = 'NULL',
  WHILE = 'WHILE',
}

export enum Keyword {
  fn = 'FUNCTION',
  let = 'LET',
  true = 'TRUE',
  false = 'FALSE',
  if = 'IF',
  else = 'ELSE',
  return = 'RETURN',
  null = 'NULL',
  while = 'WHILE',
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

export type LValue = Token | IndexExpression

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

export class IndexExpression implements Expression {
  node: Token = {
    type: TokenType.INDEX,
  }
  left: Expression
  index: Expression

  constructor(left: Expression, index: Expression) {
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

export class ArrayLiteralExpression implements Expression {
  elements: Expression[] = []
  node: Token

  constructor(elements: Expression[], node: Token) {
    this.elements = elements
    this.node = node
  }
}

export abstract class IterableObject {
  abstract _length(): number
}

export class ArrayObject extends IterableObject implements Object {
  elements: (Object | Value)[] = []
  length: number = 0

  constructor(elements: (Object | Value)[]) {
    super()
    this.elements = elements
    this.length = elements.length
  }

  asString() {
    return `[${this.elements.map((e) => asString(e)).join(', ')}]`
  }

  _length() {
    return this.length
  }
}

const asString = (value: Object | Value) => {
  if (value instanceof Object) {
    return value.asString()
  }
  return value
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
export class FunctionObject implements Object {
  parameters: Token[]
  body: Statement[]
  store: Store

  constructor(parameters: Token[], body: Statement[], store: Store) {
    this.parameters = parameters
    this.body = body
    this.store = store
  }

  asString() {
    return `FUNCTION_OBJECT(${this.parameters.map((p) => p.value).join(', ')})`
  }
}

export class NativeFunction extends FunctionObject {
  fn: (...args: any[]) => any
  name: string
  constructor(name: string, fn: (...args: any[]) => any) {
    super([], [], null!)
    this.name = name
    this.fn = fn
  }

  asString() {
    return `NATIVE_FUNCTION(${this.name})`
  }
}
