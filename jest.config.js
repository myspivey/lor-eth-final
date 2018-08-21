module.exports = {
  preset: 'jest-preset-angular',
  roots: ['src'],
  setupTestFrameworkScriptFile: '<rootDir>/src/setup-jest.ts',
  moduleNameMapper: {
    '@lor/core/(.*)': '<rootDir>/src/app/core/$1',
    '@lor/shared/(.*)': '<rootDir>/src/app/shared/$1',
  },
  transform: {
    "^.+\\.(ts|html)$": "<rootDir>/node_modules/jest-preset-angular/preprocessor.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!@ngxs)"
  ],
};
