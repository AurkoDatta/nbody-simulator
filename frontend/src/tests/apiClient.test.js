import { beforeEach, describe, expect, it } from 'vitest'

import { TOKEN_STORAGE_KEY, UNAUTHORIZED_EVENT, attachAuthHeader, handleResponseError } from '../services/apiClient'

describe('attachAuthHeader', () => {
  beforeEach(() => localStorage.clear())

  it('adds an Authorization header when a token is stored', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123')

    const config = attachAuthHeader({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer abc123')
  })

  it('leaves headers untouched when no token is stored', () => {
    const config = attachAuthHeader({ headers: {} })

    expect(config.headers.Authorization).toBeUndefined()
  })
})

describe('handleResponseError', () => {
  beforeEach(() => localStorage.clear())

  it('clears the stored token and dispatches the unauthorized event on a 401', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123')
    let eventFired = false
    window.addEventListener(UNAUTHORIZED_EVENT, () => {
      eventFired = true
    })

    await expect(handleResponseError({ response: { status: 401 } })).rejects.toBeTruthy()

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
    expect(eventFired).toBe(true)
  })

  it('leaves the stored token alone for non-401 errors', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'abc123')

    await expect(handleResponseError({ response: { status: 500 } })).rejects.toBeTruthy()

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('abc123')
  })
})
