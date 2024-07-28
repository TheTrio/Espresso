import { PRECEDENCES } from './parser'
import { Token } from './types'

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
  return ['+', '-', '*', '/', '<', '>', '=='].includes(token.type)
}

export const getPrecedence = (token: Token) => {
  if (Object.keys(PRECEDENCES).includes(token.type)) {
    return PRECEDENCES[token.type as keyof typeof PRECEDENCES]
  }
  return 0
}
