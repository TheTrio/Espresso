import { IllegalTokenError } from './errors'
import { TokenType, Token, Keyword } from './types'
import { isDigit, isLetter, isWhitespace } from './utils'

export class Lexer {
  position: number
  input: string
  constructor(input: string) {
    this.input = input
    this.position = 0
  }

  get currentChar() {
    if (this.position >= this.input.length) {
      return '\0'
    }
    return this.input[this.position]
  }

  readChar() {
    if (this.position >= this.input.length) {
      return '\0'
    }
    return this.input[this.position++]
  }

  nextToken(): Token {
    let token = TokenType.ILLEGAL

    // first check for two character tokens
    const twoCharToken = this.twoCharToken()

    if (twoCharToken) {
      return twoCharToken
    }

    // then check for single character tokens
    switch (this.currentChar) {
      case '\0':
        token = TokenType.EOF
        break
      case '+':
        token = TokenType.PLUS
        break
      case '-':
        token = TokenType.MINUS
        break
      case '/':
        token = TokenType.SLASH
        break
      case '*':
        token = TokenType.ASTERISK
        break
      case '(':
        token = TokenType.LEFT_PAREN
        break
      case ')':
        token = TokenType.RIGHT_PAREN
        break
      case '<':
        token = TokenType.LESS_THAN
        break
      case '>':
        token = TokenType.GREATER_THAN
        break
      case '!':
        token = TokenType.BANG
        break
      case '{':
        token = TokenType.LBRACE
        break
      case '}':
        token = TokenType.RBRACE
        break
      case '=':
        token = TokenType.ASSIGN
        break
      case ';':
        token = TokenType.SEMICOLON
        break
      case ',':
        token = TokenType.COMMA
        break
      default: {
        if (isWhitespace(this.currentChar)) {
          this.readChar()
          return this.nextToken()
        }

        if (isLetter(this.currentChar)) {
          const identifier = this.getIdentifier()
          const keyword = Keyword[identifier as keyof typeof Keyword]

          if (keyword) {
            return {
              type: TokenType[keyword as keyof typeof TokenType],
            }
          }

          return {
            type: TokenType.IDENT,
            value: identifier,
          }
        } else if (isDigit(this.currentChar)) {
          const number = this.getNumber()
          return {
            type: TokenType.INT,
            value: number,
          }
        } else {
          throw new IllegalTokenError(this.currentChar)
        }
      }
    }
    this.readChar()
    return {
      type: token,
    }
  }

  getIdentifier() {
    let identifier = ''
    while (
      isLetter(this.currentChar) ||
      (isDigit(this.currentChar) && identifier.length > 0)
    ) {
      identifier += this.currentChar
      this.readChar()
    }
    return identifier
  }

  getNumber() {
    let number = ''
    while (isDigit(this.currentChar)) {
      number += this.currentChar
      this.readChar()
    }
    return number
  }

  peakChar() {
    const nextPos = this.position + 1
    if (nextPos >= this.input.length) {
      return '\0'
    }
    return this.input[nextPos]
  }

  twoCharToken() {
    if (this.currentChar === '=') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.EQ,
        }
      }
    } else if (this.currentChar === '!') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.NOT_EQ,
        }
      }
    } else if (this.currentChar === '<') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.LESS_THAN_EQ,
        }
      }
    } else if (this.currentChar === '>') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.GREATER_THAN_EQ,
        }
      }
    }
  }
}
