import { defineConfig } from 'vitest/config';

/**********************************************************************************/

// Test timeout duration => Ky.timeout * num_of_retries + round to the upper closets pow of 2 => 4_000 * 2 + 8_000
// Teardown timeout duration => Ky.timeout * num_of_retries + round to the upper closets pow of 2 => 4_000 * 2 + 8_000
export default defineConfig({
  test: {
    root: './',
    testTimeout: 16_000,
    teardownTimeout: 16_000,
    globalSetup: './__tests__/config/setup.ts',
    logHeapUsage: true,
    slowTestThreshold: 400,
    server: {
      sourcemap: 'inline'
    },
    reporters: ['default', 'hanging-process']
  }
});
