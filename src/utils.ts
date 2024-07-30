import { PRECEDENCES } from './parser'
import { ArrayObject, DictionaryObject, FunctionObject } from './syntax/objects'
import { Token, TokenType } from './syntax/token'
import { Expression, Value } from './types'

export const isLetter = (letter: string) => {
  return letter.match(/[a-zA-Z]/) || letter == '_'
}

export const isWhitespace = (letter: string) => {
  return letter.match(/\s/)
}

export const isDigit = (letter: string) => {
  return letter.match(/\d/)
}

export const isBinaryOperator = (token: Token | null) => {
  if (!token) return false
  return ['+', '-', '*', '/', '<', '>', '==', '!=', '<=', '>='].includes(
    token.type
  )
}

export const getPrecedence = (token: Token) => {
  if (Object.keys(PRECEDENCES).includes(token.type)) {
    return PRECEDENCES[token.type as keyof typeof PRECEDENCES]
  }
  return 0
}

export const isTruthy = (value: any) => {
  return value === true
}

export const isLVal = (node: any) => {
  return node?.type === TokenType.IDENT || node?.type === TokenType.INDEX
}

export const asString = (value: any) => {
  if (value.asString) {
    return value.asString()
  }
  return value
}

export const isObject = (value: Expression | Value) => {
  if (value === null) {
    return null
  }

  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return value
  }

  return (
    value instanceof ArrayObject ||
    value instanceof DictionaryObject ||
    value instanceof FunctionObject
  )
}
