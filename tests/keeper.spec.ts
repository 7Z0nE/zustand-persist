import { configureKeeper, getKeeper } from '../src/keeper'
import { createMemoryStorage } from 'storage-memory'

describe('customRootKey', () => {
  beforeAll(() => {
    configureKeeper({
      rootKey: 'customRootKey',
      storage: createMemoryStorage(),
    })
  })

  it('should setItem getItem correctly', async () => {
    const keeper = getKeeper('customRootKey')
    await keeper.setItem('subKey', 'subKeyData')
    const result = await keeper.getItem('subKey')
    expect(result).toBe('subKeyData')
  })

  it('should setItem removeItem correctly', async () => {
    const keeper = getKeeper('customRootKey')
    await keeper.setItem('subKey', 'subKeyData')
    await keeper.removeItem('subKey')
    const result = await keeper.getItem('subKey')
    expect(result).toBeUndefined()
  })

  it('should setItem removeRoot correctly', async () => {
    const keeper = getKeeper('customRootKey')
    await keeper.setItem('subKey', 'subKeyData')
    await keeper.removeRoot()
    const result = await keeper.getItem('subKey')
    expect(result).toBeUndefined()
  })
})

describe('default rootKey', () => {
  beforeAll(() => {
    configureKeeper({
      storage: createMemoryStorage(),
    })
  })

  it('should setItem getItem correctly', async () => {
    const keeper = getKeeper()
    await keeper.setItem('subKey', 'subKeyData')
    const result = await keeper.getItem('subKey')
    expect(result).toBe('subKeyData')
  })

  it('should setItem removeItem correctly', async () => {
    const keeper = getKeeper()
    await keeper.setItem('subKey', 'subKeyData')
    await keeper.removeItem('subKey')
    const result = await keeper.getItem('subKey')
    expect(result).toBeUndefined()
  })

  it('should setItem removeRoot correctly', async () => {
    const keeper = getKeeper()
    await keeper.setItem('subKey', 'subKeyData')
    await keeper.removeRoot()
    const result = await keeper.getItem('subKey')
    expect(result).toBeUndefined()
  })
})
