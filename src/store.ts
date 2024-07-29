export class Store {
  data: Map<string, any> = new Map()
  parentStore: Store | null = null

  constructor(parentStore: Store | null = null) {
    this.parentStore = parentStore
  }

  set(key: string, value: any) {
    this.data.set(key, value)
  }

  get(key: string): any {
    if (this.data.has(key)) {
      return this.data.get(key)
    }
    if (this.parentStore) {
      return this.parentStore.get(key)
    }
  }
}