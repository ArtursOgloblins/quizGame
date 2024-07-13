export const aDescribe = (skip: boolean): jest.Describe => {
  if (skip) {
    return describe.skip;
  }
  return describe;
};

export const skipSettings = {
  run_all_tests: true, // Установите это значение в true, чтобы выполнять все тесты

  authTest: true, // Установите это значение в true, чтобы выполнять конкретный тест

  for(testName: TestsNames): boolean {
    // If we need run all tests without skip
    if (this.run_all_tests) {
      return false;
    }

    // if test setting exist we need return his setting
    if (typeof this[testName] === 'boolean') {
      return this[testName];
    }

    return false;
  },
};

export type TestsNames = 'authTest';
