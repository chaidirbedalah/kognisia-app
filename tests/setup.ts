// Test setup file for vitest
// This file runs before all tests

import { beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  // Setup code that runs before all tests
  console.log('Setting up tests...')
})

afterAll(() => {
  // Cleanup code that runs after all tests
  console.log('Cleaning up tests...')
})
