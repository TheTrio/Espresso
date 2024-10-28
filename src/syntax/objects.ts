import { IterableIndexOutOfBoundsError } from '../errors'
import { Store } from '../store'
import {
  Expression,
  IterableObject,
  BaseObject,
  Statement,
  Value,
} from '../types'
import { asString } from '../utils'
import { Token } from './token'

export class DictionaryObject extends IterableObject implements BaseObject {
  private elements: Map<string, BaseObject | Value> = new Map()

  constructor(elements: Map<string, BaseObject | Value>) {
    super()
    this.elements = elements
  }

  asString(): string {
    return `{${Array.from(this.elements)
      .map(([key, value]) => `${asString(key)}: ${value}`)
      .join(', ')}}`
  }

  at(key: any) {
    return this.elements.get(key) ?? null
  }

  set(key: any, value: any) {
    this.elements.set(key, value)
  }

  _length(): number {
    return this.elements.size
  }
}

export class ArrayObject extends IterableObject implements BaseObject {
  private elements: (BaseObject | Value)[] = []
  private length: number = 0

  constructor(elements: (BaseObject | Value)[]) {
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

  at(index: any) {
    if (typeof index !== 'number') {
      throw new Error('Index must be a number')
    }
    const newIndex = index < 0 ? this.length + index : index
    if (newIndex < 0 || newIndex >= this.elements.length) {
      throw new IterableIndexOutOfBoundsError(index, this.length)
    }
    return this.elements.at(index)
  }

  set(index: any, value: any) {
    if (typeof index !== 'number') {
      throw new Error('Index must be a number')
    }
    const newIndex = index < 0 ? this.length + index : index
    if (newIndex < 0 || newIndex >= this.elements.length) {
      throw new IterableIndexOutOfBoundsError(index, this.length)
    }

    this.elements[this.toPositiveIndex(index)] = value
  }

  push(value: any) {
    this.elements.push(value)
    this.length++
  }

  pop(index?: any) {
    if (this.length === 0) {
      throw new Error('Cannot pop from empty array')
    }
    if (index === undefined) {
      return this.elements.pop()
    }

    if (typeof index !== 'number') {
      throw new Error('Expected number, got ' + typeof index)
    }
    const newIndex = index < 0 ? this.length + index : index
    if (newIndex < 0 || newIndex >= this.elements.length) {
      throw new IterableIndexOutOfBoundsError(index, this.length)
    }
    return this.elements.splice(this.toPositiveIndex(index), 1)[0]
  }

  private toPositiveIndex(index: number) {
    if (index < 0) {
      return this.length + index
    }
    return index
  }
}

export class FunctionObject implements BaseObject {
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
