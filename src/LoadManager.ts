export class LoadManager {
  private onAllLoadedCallback: () => void
  private loadStatusRecord: Record<string, boolean>

  constructor() {
    this.onAllLoadedCallback = () => {}
    this.loadStatusRecord = {}
  }

  register(key: string) {
    this.loadStatusRecord[key] = false
  }

  isLoaded(key: string) {
    return this.loadStatusRecord[key]
  }

  onAllLoaded(callback: () => void) {
    this.onAllLoadedCallback = callback
  }

  setLoaded(key: string) {
    this.loadStatusRecord[key] = true
    if (Object.values(this.loadStatusRecord).every(Boolean)) {
      this.onAllLoadedCallback()
    }
  }
}

const cachedLoadManagers = new Map<string, LoadManager>()

export function getLoadManager(key: string | undefined) {
  if (!key) key = 'root'
  let manager = cachedLoadManagers.get(key)

  if (!manager) {
    manager = new LoadManager()
    cachedLoadManagers.set(key, manager)
  }

  return manager
}

export function getLoadManagers() {
  return Array.from(cachedLoadManagers.values())
}
