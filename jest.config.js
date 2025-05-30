module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      babelConfig: false,
    }],
    '^.+\\.(js|jsx)$': 'babel-jest', // For completeness, if any JS files need Babel
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    // Example for path alias if src is aliased as @
    // '^@/(.*)$': '<rootDir>/src/$1',
  },
  // setupFilesAfterEnv: ['@testing-library/jest-dom'], // Already in package.json, but good practice
  // No, the correct path is '@testing-library/jest-dom/extend-expect' for Jest to pick up the matchers
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
