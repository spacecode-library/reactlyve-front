module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.app.json', // Point to the config with actual compiler options
      babelConfig: false, // Do not use babel if ts-jest is handling transpilation
    }],
    '^.+\\.(js|jsx)$': 'babel-jest', // If you have JS files to transpile, ensure babel-jest is configured
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    // Mock CSS imports (if you import CSS files directly in your components)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Mock image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
};
