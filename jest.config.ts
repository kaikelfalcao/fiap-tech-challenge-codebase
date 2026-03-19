export default {
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testEnvironment: 'node',

  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['/dist/'],

  fakeTimers: { enableGlobally: true },

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // highlight-start
  transformIgnorePatterns: ['/node_modules/(?!(uuid)/)'],
  // highlight-end
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',

    '^@/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
};
