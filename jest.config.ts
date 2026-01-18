export default {
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',

  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['/dist/'],

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',

    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },

  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
};
