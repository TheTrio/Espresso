import { ArrayIndexOutOfBoundsError } from './errors'
import { PRECEDENCES } from './parser'
import { ArrayObject, Token, TokenType } from './types'

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

export const throwIfInvalidArrayIndexAccess = (array: any, index: any) => {
  if (!(array instanceof ArrayObject)) {
    throw new Error('Trying to index a non-array object')
  }
  if (typeof index !== 'number') {
    throw new Error('Index must be a number')
  }
  if (index < 0 || index >= array.elements.length) {
    throw new ArrayIndexOutOfBoundsError(index, array.elements.length)
  }
  return true
}
