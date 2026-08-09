import { beforeEach, describe, expect, it, vi } from 'vitest'

import apiClient from '../services/apiClient'
import * as authService from '../services/authService'

vi.mock('../services/apiClient', () => ({
  default: { post: vi.fn() },
}))

describe('authService', () => {
  beforeEach(() => {
    apiClient.post.mockReset()
  })

  it('register posts to /auth/register and returns the response body', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 't', user: { id: '1' } } })

    const result = await authService.register('Ada', 'ada@example.com', 'secret123')

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret123',
    })
    expect(result).toEqual({ token: 't', user: { id: '1' } })
  })

  it('login posts to /auth/login and returns the response body', async () => {
    apiClient.post.mockResolvedValue({ data: { token: 't', user: { id: '1' } } })

    const result = await authService.login('ada@example.com', 'secret123')

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'ada@example.com',
      password: 'secret123',
    })
    expect(result).toEqual({ token: 't', user: { id: '1' } })
  })
})
