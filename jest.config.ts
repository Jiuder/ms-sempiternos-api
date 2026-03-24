import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          transform: { legacyDecorator: true, decoratorMetadata: true },
        },
      },
    ],
  },
  collectCoverageFrom: ['**/*.(controller|service).(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@redis/(.*)$': '<rootDir>/redis/$1',
    '^@logs/(.*)$': '<rootDir>/logs/$1',
    '^@stats/(.*)$': '<rootDir>/stats/$1',
    '^@swagger/(.*)$': '<rootDir>/swagger/$1',
    '^@filter-history/(.*)$': '<rootDir>/filter-history/$1',
  },
};

export default config;
