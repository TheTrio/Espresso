export type Token = {
  type: TokenType
  value?: string
  line: number
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
  COLON = ':',

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
