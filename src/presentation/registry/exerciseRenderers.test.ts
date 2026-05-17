import { describe, it, expect } from 'vitest'
import { registerRenderer, getRenderer } from './exerciseRenderers'

describe('exerciseRenderers registry', () => {
  it('returns null for unregistered key', () => {
    expect(getRenderer('nonexistent-key')).toBeNull()
  })

  it('registers and retrieves a renderer', () => {
    const FakeComponent = () => null
    registerRenderer('test-subject', FakeComponent as any)
    expect(getRenderer('test-subject')).toBe(FakeComponent)
  })

  it('overwrites previous registration for same key', () => {
    const First = () => null
    const Second = () => null
    registerRenderer('overwrite-test', First as any)
    registerRenderer('overwrite-test', Second as any)
    expect(getRenderer('overwrite-test')).toBe(Second)
  })
})
