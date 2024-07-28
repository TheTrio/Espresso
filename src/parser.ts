import { Lexer } from './lexer'
import {
  BinaryExpression,
  Expression,
  FunctionCallExpression,
  FunctionExpression,
  IfElseExpression,
  LetStatement,
  Statement,
  Token,
  TokenType,
  UnaryExpression,
} from './types'
import { getPrecedence, isBinaryOperator } from './utils'

export const PRECEDENCES = {
  [TokenType.PLUS]: 1,
  [TokenType.MINUS]: 1,
  [TokenType.ASTERISK]: 2,
  [TokenType.SLASH]: 2,
  [TokenType.LEFT_PAREN]: 3,
  [TokenType.LESS_THAN]: 4,
  [TokenType.GREATER_THAN]: 4,
}

export class Parser {
  lexer: Lexer
  statements: Statement[] = []
  tokens: Token[] = []
  position: number = 0
  errors: string[] = []

  PREFIX_FUNCTIONS = {
    [TokenType.INT]: this.parseIntegerLiteral.bind(this),
    [TokenType.MINUS]: this.parsePrefixExpression.bind(this),
    [TokenType.PLUS]: this.parsePrefixExpression.bind(this),
    [TokenType.IDENT]: this.parseIdentifier.bind(this),
    [TokenType.BANG]: this.parsePrefixExpression.bind(this),
    [TokenType.TRUE]: this.parseBoolean.bind(this),
    [TokenType.FALSE]: this.parseBoolean.bind(this),
    [TokenType.LEFT_PAREN]: this.parseGroupedExpression.bind(this),
    [TokenType.IF]: this.parseIfExpression.bind(this),
    [TokenType.FUNCTION]: this.parseFunctions.bind(this),
  }

  constructor(code: string) {
    this.lexer = new Lexer(code)
    while (true) {
      const token = this.lexer.nextToken()
      this.tokens.push(token)
      if (token.type === TokenType.EOF) {
        break
      }
    }
  }

  currentToken() {
    if (this.position >= this.tokens.length) {
      return null
    }
    return this.tokens[this.position]
  }

  parse() {
    while (this.currentToken()?.type !== TokenType.EOF && this.currentToken()) {
      const statement = this.parseStatement()
      if (statement) {
        this.statements.push(statement)
      }
    }
    return this.statements
  }

  private parseStatement() {
    switch (this.currentToken()?.type) {
      case TokenType.LET:
        return this.parseLetStatement()
      default:
        const statement = this.parseExpression()!
        if (this.currentToken()?.type === TokenType.SEMICOLON) {
          this.position++
        }
        return statement
    }
  }

  parseLetStatement() {
    this.match(TokenType.LET)
    const letStatement = new LetStatement()
    letStatement.lvalue = this.match(TokenType.IDENT)!

    this.match(TokenType.ASSIGN)

    letStatement.rvalue = this.parseExpression()
    this.match(TokenType.SEMICOLON)
    return letStatement
  }

  parseExpression(parentPrecedence: number = 0): Expression | null {
    let leftExpression: Expression | null = null
    const prefixFunction =
      this.PREFIX_FUNCTIONS[
        this.currentToken()!.type as keyof typeof this.PREFIX_FUNCTIONS
      ]

    if (prefixFunction) {
      leftExpression = prefixFunction()
    } else {
      this.errors.push(`Unknown prefix operator ${this.currentToken()?.type}`)
      return null
    }

    const token = this.currentToken()

    if (isBinaryOperator(token)) {
      while (
        this.currentToken()?.type !== TokenType.SEMICOLON &&
        getPrecedence(this.currentToken()!) > parentPrecedence
      ) {
        const operator = this.currentToken()!
        this.position++
        const rightExpression = this.parseExpression(getPrecedence(operator))
        leftExpression = new BinaryExpression(
          operator,
          leftExpression,
          rightExpression!
        )
      }
    }
    return leftExpression!
  }

  parseIntegerLiteral(): Expression {
    return {
      node: this.match(TokenType.INT)!,
    }
  }

  parsePrefixExpression(): Expression {
    const token = this.currentToken()
    this.position++
    return new UnaryExpression(
      token!,
      this.parseExpression(PRECEDENCES[token?.type as keyof typeof PRECEDENCES])
    )
  }

  parseIdentifier(): Expression {
    if (this.peekToken?.type === TokenType.LEFT_PAREN) {
      return this.parseCallExpression()
    }
    return {
      node: this.match(TokenType.IDENT)!,
    }
  }

  parseBoolean(): Expression {
    return {
      node: this.match(this.currentToken()!.type)!,
    }
  }

  parseGroupedExpression(): Expression {
    this.match(TokenType.LEFT_PAREN)
    const expression = this.parseExpression()
    this.match(TokenType.RIGHT_PAREN)
    return expression!
  }

  parseIfExpression(): Expression {
    const token = this.match(TokenType.IF)
    this.match(TokenType.LEFT_PAREN)
    const condition = this.parseExpression()
    this.match(TokenType.RIGHT_PAREN)
    this.match(TokenType.LBRACE)
    const consequence = this.parseBlockStatement()
    this.match(TokenType.RBRACE)

    if (this.currentToken()?.type === TokenType.ELSE) {
      this.position++
      this.match(TokenType.LBRACE)
      const alternative = this.parseBlockStatement()
      this.match(TokenType.RBRACE)
      return new IfElseExpression(token!, condition, consequence, alternative)
    }

    return new IfElseExpression(token!, condition, consequence, [])
  }

  parseBlockStatement() {
    const statements: Statement[] = []
    while (
      this.currentToken() &&
      this.currentToken()?.type !== TokenType.RBRACE &&
      this.currentToken()?.type !== TokenType.EOF
    ) {
      const statement = this.parseStatement()
      if (statement) {
        statements.push(statement)
      }
    }
    return statements
  }

  parseFunctions(): Expression {
    const funcToken = this.match(TokenType.FUNCTION)
    this.match(TokenType.LEFT_PAREN)
    const parameters = this.parseFunctionParameters()
    this.match(TokenType.RIGHT_PAREN)
    this.match(TokenType.LBRACE)
    const body = this.parseBlockStatement()
    this.match(TokenType.RBRACE)

    return new FunctionExpression(parameters, body, funcToken!)
  }

  parseCallExpression() {
    const token = this.match(TokenType.IDENT)
    this.match(TokenType.LEFT_PAREN)
    const parameters = this.parseCallArguments()
    this.match(TokenType.RIGHT_PAREN)
    return new FunctionCallExpression(parameters, token!)
  }

  parseCallArguments() {
    const args: Expression[] = []
    while (
      this.currentToken()?.type !== TokenType.RIGHT_PAREN &&
      this.currentToken()?.type !== TokenType.EOF &&
      this.currentToken()
    ) {
      const argument = this.parseExpression()
      if (argument) {
        args.push(argument)
      }
      if (this.currentToken()?.type === TokenType.COMMA) {
        this.position++
      }
    }
    return args
  }

  parseFunctionParameters() {
    const parameters: Token[] = []
    while (
      this.currentToken()?.type !== TokenType.RIGHT_PAREN &&
      this.currentToken()?.type !== TokenType.EOF &&
      this.currentToken()
    ) {
      const parameter = this.match(TokenType.IDENT)
      if (parameter) {
        parameters.push(parameter)
      }
      if (this.currentToken()?.type === TokenType.COMMA) {
        this.position++
      }
    }
    return parameters
  }

  match(tokenType: TokenType) {
    if (this.currentToken()?.type === tokenType) {
      const token = this.currentToken()
      this.position++
      return token
    }
    this.errors.push(
      `expected ${tokenType} but got ${this.currentToken()?.type}`
    )
    this.position++
  }

  get peekToken() {
    if (this.position + 1 >= this.tokens.length) {
      return null
    }
    return this.tokens[this.position + 1]
  }
}
