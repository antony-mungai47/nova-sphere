import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/domains/**/*.ts',
    '!src/domains/**/*.test.ts',
    '!src/domains/**/contracts/*.ts'
  ],
  testMatch: [
    '<rootDir>/src/domains/**/*.test.ts',
    '<rootDir>/tests/domains/**/*.test.ts'
  ]
};

export default config;
