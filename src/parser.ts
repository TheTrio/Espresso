import { SyntaxError } from './errors'
import { Lexer } from './lexer'
import {
  ArrayLiteralExpression,
  BinaryExpression,
  BlockExpression,
  Expression,
  FunctionCallExpression,
  FunctionExpression,
  IfElseExpression,
  IndexExpression,
  LetStatement,
  ReassignmentStatement,
  ReturnStatement,
  Statement,
  Token,
  TokenType,
  UnaryExpression,
  WhileExpression,
} from './types'
import { getPrecedence, isBinaryOperator, isLVal } from './utils'

export const PRECEDENCES = {
  [TokenType.PLUS]: 1,
  [TokenType.MINUS]: 1,
  [TokenType.ASSIGN]: 1,
  [TokenType.LESS_THAN]: 1,
  [TokenType.GREATER_THAN]: 1,
  [TokenType.LESS_THAN_EQ]: 1,
  [TokenType.GREATER_THAN_EQ]: 1,
  [TokenType.EQ]: 1,
  [TokenType.NOT_EQ]: 1,
  [TokenType.ASTERISK]: 2,
  [TokenType.SLASH]: 2,
  [TokenType.LEFT_PAREN]: 3,
  [TokenType.LBRACKET]: 3,
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
    [TokenType.NULL]: this.parseNull.bind(this),
    [TokenType.LEFT_PAREN]: this.parseGroupedExpression.bind(this),
    [TokenType.IF]: this.parseIfExpression.bind(this),
    [TokenType.FUNCTION]: this.parseFunctions.bind(this),
    [TokenType.LBRACE]: this.parseBlockExpression.bind(this),
    [TokenType.QUOTE]: this.parseStringLiteral.bind(this),
    [TokenType.WHILE]: this.parseWhileExpression.bind(this),
    [TokenType.LBRACKET]: this.parseArrayLiteral.bind(this),
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
    let lastPosition = this.position
    while (this.currentToken()?.type !== TokenType.EOF && this.currentToken()) {
      const statement = this.parseStatement()
      if (statement) {
        this.statements.push(statement)
      }
      if (this.position === lastPosition) {
        break
      } else {
        lastPosition = this.position
      }
    }
    if (this.errors.length > 0) {
      throw new SyntaxError(this.errors)
    }
    return this.statements
  }

  private parseArrayLiteral() {
    const token = this.match(TokenType.LBRACKET)
    const elements: Expression[] = []
    while (
      this.currentToken()?.type !== TokenType.RBRACKET &&
      this.currentToken()?.type !== TokenType.EOF
    ) {
      const element = this.parseExpression()
      if (element) {
        elements.push(element)
      }
      if (this.currentToken()?.type === TokenType.COMMA) {
        this.position++
      }
    }
    this.match(TokenType.RBRACKET)
    return new ArrayLiteralExpression(elements, token!)
  }

  private parseWhileExpression() {
    const token = this.match(TokenType.WHILE)
    this.match(TokenType.LEFT_PAREN)
    const condition = this.parseExpression()
    this.match(TokenType.RIGHT_PAREN)
    this.match(TokenType.LBRACE)
    const body = this.parseBlockStatement()
    this.match(TokenType.RBRACE)
    return new WhileExpression(token!, condition, body)
  }

  private parseStringLiteral() {
    return {
      node: this.match(TokenType.QUOTE)!,
    }
  }

  private parseStatement() {
    switch (this.currentToken()?.type) {
      case TokenType.LET:
        return this.parseLetStatement()
      case TokenType.RETURN:
        return this.parseReturnStatement()
      default:
        const statement = this.parseExpression()!
        if (this.currentToken()?.type === TokenType.SEMICOLON) {
          this.position++
        }
        return statement
    }
  }

  private parseNull() {
    return {
      node: this.match(TokenType.NULL)!,
    }
  }

  private parseLetStatement() {
    this.match(TokenType.LET)
    const letStatement = new LetStatement()
    letStatement.lvalue = this.match(TokenType.IDENT)!

    this.match(TokenType.ASSIGN)

    letStatement.rvalue = this.parseExpression()
    this.match(TokenType.SEMICOLON)
    return letStatement
  }

  private parseReturnStatement() {
    this.match(TokenType.RETURN)
    const returnStatement = new ReturnStatement(this.parseExpression()!)
    this.match(TokenType.SEMICOLON)
    return returnStatement
  }

  private parseExpression(parentPrecedence: number = 0): Expression | null {
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

    while (
      this.currentToken()?.type !== TokenType.SEMICOLON &&
      this.currentToken()?.type !== TokenType.EOF &&
      getPrecedence(this.currentToken()!) > parentPrecedence
    ) {
      if (isBinaryOperator(this.currentToken())) {
        const operator = this.currentToken()!
        this.position++
        const rightExpression = this.parseExpression(getPrecedence(operator))
        leftExpression = new BinaryExpression(
          operator,
          leftExpression!,
          rightExpression!
        )
      } else if (this.currentToken()?.type === TokenType.LEFT_PAREN) {
        const token = this.currentToken()
        this.position++
        leftExpression = new FunctionCallExpression(
          this.parseCallArguments(),
          token!,
          leftExpression!
        )
        this.match(TokenType.RIGHT_PAREN)
      } else if (this.currentToken()?.type === TokenType.LBRACKET) {
        this.position++
        const index = this.parseExpression()
        this.match(TokenType.RBRACKET)
        leftExpression = new IndexExpression(leftExpression!, index!)
      } else if (this.currentToken()?.type === TokenType.ASSIGN) {
        this.position++
        const rightExpression = this.parseExpression()
        if (!isLVal(leftExpression?.node)) {
          throw new SyntaxError([
            `Expected lvalue, got ${leftExpression?.node.type}`,
          ])
        }
        leftExpression = new ReassignmentStatement(
          leftExpression instanceof IndexExpression
            ? leftExpression
            : leftExpression!.node,
          rightExpression!
        )
      } else {
        throw new SyntaxError([
          `Unknown token ${this.currentToken()?.type} in expression`,
        ])
      }
    }
    return leftExpression!
  }

  private parseIntegerLiteral(): Expression {
    return {
      node: this.match(TokenType.INT)!,
    }
  }

  private parsePrefixExpression(): Expression {
    const token = this.currentToken()
    this.position++
    return new UnaryExpression(
      token!,
      this.parseExpression(PRECEDENCES[token?.type as keyof typeof PRECEDENCES])
    )
  }

  private parseIdentifier(): Expression {
    return {
      node: this.match(TokenType.IDENT)!,
    }
  }

  private parseBoolean(): Expression {
    return {
      node: this.match(this.currentToken()!.type)!,
    }
  }

  private parseGroupedExpression(): Expression {
    this.match(TokenType.LEFT_PAREN)
    const expression = this.parseExpression()
    this.match(TokenType.RIGHT_PAREN)
    return expression!
  }

  private parseIfExpression(): Expression {
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

  private parseBlockStatement() {
    const statements: Statement[] = []
    while (
      this.currentToken() &&
      this.currentToken()?.type !== TokenType.RBRACE &&
      this.currentToken()?.type !== TokenType.EOF
    ) {
      const statement = this.parseStatement()
      if (statement) {
        statements.push(statement)
      } else {
        this.position++
      }
    }
    return statements
  }

  private parseBlockExpression(): Expression | null {
    this.match(TokenType.LBRACE)
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
    this.match(TokenType.RBRACE)
    return new BlockExpression(statements)
  }

  private parseFunctions(): Expression {
    const funcToken = this.match(TokenType.FUNCTION)
    this.match(TokenType.LEFT_PAREN)
    const parameters = this.parseFunctionParameters()
    this.match(TokenType.RIGHT_PAREN)
    this.match(TokenType.LBRACE)
    const body = this.parseBlockStatement()
    this.match(TokenType.RBRACE)

    return new FunctionExpression(parameters, body, funcToken!)
  }

  private parseCallArguments() {
    const args: Expression[] = []
    while (
      this.currentToken()?.type !== TokenType.RIGHT_PAREN &&
      this.currentToken()?.type !== TokenType.EOF &&
      this.currentToken()
    ) {
      const argument = this.parseExpression()
      if (argument) {
        args.push(argument)
      } else {
        this.position++
      }
      if (this.currentToken()?.type === TokenType.COMMA) {
        this.position++
      }
    }
    return args
  }

  private parseFunctionParameters() {
    const parameters: Token[] = []
    while (
      this.currentToken()?.type !== TokenType.RIGHT_PAREN &&
      this.currentToken()?.type !== TokenType.EOF &&
      this.currentToken()
    ) {
      const parameter = this.match(TokenType.IDENT)
      if (parameter) {
        parameters.push(parameter)
      } else {
        this.position++
      }
      if (this.currentToken()?.type === TokenType.COMMA) {
        this.position++
      }
    }
    return parameters
  }

  private match(tokenType: TokenType) {
    if (this.currentToken()?.type === tokenType) {
      const token = this.currentToken()
      this.position++
      return token
    }
    this.errors.push(
      `expected ${tokenType} but got ${this.currentToken()?.type}`
    )
  }
}
