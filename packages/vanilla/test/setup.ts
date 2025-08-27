import { beforeAll, afterEach, afterAll } from 'vitest';

// Mock DOM environment
beforeAll(() => {
  // Set up any global test configuration
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  // Clean up DOM after each test
  document.body.innerHTML = '';
});

afterAll(() => {
  // Clean up any global resources
});
