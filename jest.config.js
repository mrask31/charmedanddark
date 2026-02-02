module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/lib', '<rootDir>/app'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/**/*.ts',
    'app/**/*.tsx',
    '!lib/**/*.test.ts',
    '!app/**/*.test.ts',
    '!app/**/*.test.tsx',
    '!lib/**/__tests__/**',
    '!app/**/__tests__/**',
  ],
};
