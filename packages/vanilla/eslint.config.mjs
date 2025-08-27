import { createConfig } from '@repo/eslint-config';

export default createConfig({
  extends: ['@repo/eslint-config/base'],
  rules: {
    // Vanilla JS specific rules
    'no-restricted-globals': 'off',
    'no-restricted-properties': 'off',
  },
});
