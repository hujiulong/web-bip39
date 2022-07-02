module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  verbose: true,
  setupFiles: ['<rootDir>/test/setup.ts'],
  roots: ['<rootDir>/test/'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
};
