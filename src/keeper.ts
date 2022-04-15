import { parseJson } from './parseJson'

interface AnyStorage {
  setItem: (key: string, value: string) => Promise<void> | void
  getItem: (key: string) => Promise<string | null> | string | null
  removeItem: (key: string) => Promise<void> | void
}

export interface KeeperOption {
  storage: AnyStorage
  rootKey?: string
}

export class Keeper {
  _rootKey!: string
  _storage!: AnyStorage
  _cachedRoot: any = null
  isRemovingRoot = false

  constructor(option: KeeperOption) {
    this.configureKeeper(option)
  }

  configureKeeper(option: KeeperOption) {
    this._storage = option.storage
    this._rootKey = option?.rootKey || this._rootKey
  }

  async getItem(key: string) {
    const draft = await this.getRoot()
    return draft[key]
  }

  async setItem(key: string, value: string) {
    const draft = await this.getRoot()
    draft[key] = value

    if (this.isRemovingRoot) {
      return
    }
    this._cachedRoot = draft
    await this._storage.setItem(this._rootKey, JSON.stringify(draft))
  }

  async removeItem(key: string) {
    const draft = await this.getRoot()
    delete draft[key]
    await this._storage.setItem(this._rootKey, JSON.stringify(draft))
  }

  async getRoot() {
    if (this._cachedRoot) {
      return this._cachedRoot
    }
    this._cachedRoot = parseJson(await this._storage.getItem(this._rootKey))
    return this._cachedRoot
  }

  async removeRoot() {
    this.isRemovingRoot = true
    await this._storage.removeItem(this._rootKey)
    this._cachedRoot = undefined
    this.isRemovingRoot = false
  }
}

let _keepers = new Map<string, Keeper>()

export function configureKeeper(option: KeeperOption) {
  if (!option.rootKey) option.rootKey = 'root'

  let keeper = _keepers.get(option.rootKey)

  if (keeper) keeper.configureKeeper(option)
  else {
    keeper = new Keeper(option)
    _keepers.set(option.rootKey, keeper)
  }

  return keeper
}

export function getKeeper(key: string = 'root') {
  return _keepers.get(key)
}
