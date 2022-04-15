import { getLoadManager } from './LoadManager'
import { SetState, GetState, StateCreator, State } from 'zustand'
import { parseJson } from './parseJson'
import { configureKeeper, KeeperOption } from './keeper'
import reconcile, { NonFunctionPropertyNames } from './reconcile'

export interface PersistOption<S extends State> {
  key: string
  denylist?: NonFunctionPropertyNames<S>[]
  allowlist?: NonFunctionPropertyNames<S>[]
}

type ConfigurePersistOption = KeeperOption

export function configurePersist(option: ConfigurePersistOption) {
  const keeper = configureKeeper(option)
  const loadManager = getLoadManager(option.rootKey)

  async function hydrate<TState extends State>(
    key: string,
    set: SetState<TState>,
    get: GetState<TState>
  ) {
    if (!loadManager.isLoaded(key)) {
      const saveState = parseJson(await keeper.getItem(key))
      if (saveState) {
        set({
          ...get(),
          ...saveState,
        })
      }

      loadManager.setLoaded(key)
    }
  }

  const persist = <TState extends State>(
    option: PersistOption<TState>,
    fn: StateCreator<TState>
  ): StateCreator<TState> => (set, get, api) => {
    const { key, allowlist, denylist } = option
    loadManager.register(key)
    hydrate<TState>(key, set, get)

    return fn(
      async (payload) => {
        set(payload)
        const state = reconcile(get(), { allowlist, denylist })
        await keeper.setItem(key, JSON.stringify(state))
      },
      get,
      api
    )
  }

  async function purge() {
    return keeper.removeRoot()
  }

  return {
    persist,
    purge,
  }
}
