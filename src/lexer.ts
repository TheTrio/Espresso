import { IllegalTokenError, SyntaxError } from './errors'
import { Keyword } from './syntax/keywords'
import { Token, TokenType } from './syntax/token'
import { isDigit, isLetter, isWhitespace } from './utils'

export class Lexer {
  position: number
  input: string

  constructor(input: string) {
    this.input = input
    this.position = 0
  }

  currentChar() {
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

    const twoCharToken = this.twoCharToken()

    if (twoCharToken) {
      return twoCharToken
    }

    switch (this.currentChar()) {
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
      case '[':
        token = TokenType.LBRACKET
        break
      case ']':
        token = TokenType.RBRACKET
        break
      case ':':
        token = TokenType.COLON
        break
      case '"':
        this.readChar()
        const value = this.getString()
        return {
          type: TokenType.QUOTE,
          value,
        }
      default: {
        if (isWhitespace(this.currentChar())) {
          this.readChar()
          return this.nextToken()
        }

        if (isLetter(this.currentChar())) {
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
        } else if (isDigit(this.currentChar())) {
          const number = this.getNumber()
          return {
            type: TokenType.INT,
            value: number,
          }
        } else {
          throw new IllegalTokenError(this.currentChar())
        }
      }
    }
    this.readChar()
    return {
      type: token,
    }
  }

  private getString() {
    let str = ''
    while (this.currentChar() !== '"' && this.currentChar() !== '\0') {
      str += this.currentChar()
      this.readChar()
    }
    if (this.currentChar() !== '"') {
      throw new SyntaxError(['Unterminated string'])
    }
    this.readChar()
    return str
  }

  private getIdentifier() {
    let identifier = ''
    while (
      isLetter(this.currentChar()) ||
      (isDigit(this.currentChar()) && identifier.length > 0)
    ) {
      identifier += this.currentChar()
      this.readChar()
    }
    return identifier
  }

  private getNumber() {
    let number = ''
    while (isDigit(this.currentChar())) {
      number += this.currentChar()
      this.readChar()
    }
    return number
  }

  private peakChar() {
    const nextPos = this.position + 1
    if (nextPos >= this.input.length) {
      return '\0'
    }
    return this.input[nextPos]
  }

  private twoCharToken() {
    if (this.currentChar() === '=') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.EQ,
        }
      }
    } else if (this.currentChar() === '!') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.NOT_EQ,
        }
      }
    } else if (this.currentChar() === '<') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.LESS_THAN_EQ,
        }
      }
    } else if (this.currentChar() === '>') {
      if (this.peakChar() === '=') {
        this.position += 2
        return {
          type: TokenType.GREATER_THAN_EQ,
        }
      }
    } else if (this.currentChar() === '/') {
      if (this.peakChar() === '/') {
        this.position += 2
        while (this.currentChar() !== '\n' && this.currentChar() !== '\0') {
          this.readChar()
        }
      }
    }
  }
}
