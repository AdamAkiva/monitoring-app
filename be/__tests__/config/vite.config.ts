import { defineConfig } from 'vitest/config';

/**********************************************************************************/

export default defineConfig({
  test: {
    root: './',
    testTimeout: 8_000,
    teardownTimeout: 4_000,
    globalSetup: './__tests__/config/setup.ts',
    logHeapUsage: true,
    server: {
      sourcemap: 'inline'
    },
    reporters: 'default'
  }
});
