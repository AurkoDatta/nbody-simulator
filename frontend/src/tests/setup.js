import '@testing-library/jest-dom/vitest'

// happy-dom doesn't implement these dialogs; stub them so tests can
// vi.spyOn(window, 'prompt'|'confirm') to simulate user responses.
if (typeof window.prompt !== 'function') {
  window.prompt = () => null
}
if (typeof window.confirm !== 'function') {
  window.confirm = () => false
}
