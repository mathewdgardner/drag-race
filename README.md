## drag-race

[![circle](https://circleci.com/gh/mathewdgardner/drag-race.svg?style=svg)](https://circleci.com/gh/mathewdgardner/drag-race)
[![coverage](https://coveralls.io/repos/github/mathewdgardner/drag-race/badge.svg?branch=master)](https://coveralls.io/github/mathewdgardner/drag-race?branch=master)
[![npm](https://img.shields.io/npm/v/drag-race.svg?maxAge=2592000)](https://www.npmjs.com/package/drag-race)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mathewdgardner/drag-race/master/LICENSE)

Run mocha style tests in parallel.

### Test Examples

The syntax is meant to be identical to mocha. There is only one caveat to this approach: each test receives a context object so that when they run in parallel the test can use the same context that the `before` and `beforeEach` used, and subsequently, the `afterEach` and `after`.

Everything is promise based using [bluebird](https://github.com/petkaantonov/bluebird) under the hood but node style callbacks are still supported.

```javascript
'use strict';

const B = require('bluebird');
const expect = require('chai').expect;

describe('Passing tests', () => {
  before(() => {
    return doSomeSetup(); // Using promise
  });

  beforeEach((context, done) => {
    doSomeSpecialSetup(); // Using no async

    done(); // Using callback
  });

  afterEach((context) => {
    return doSomeSpecialTearDown(context); // Using same context that test ran in
  });

  after((done) => {
    doSomeTearDown(done); // Using callback
  });

  it('should pass', () => {
    expect(2 + 2).to.equal(4);
  });

  it('should fail', () => {
    expect(2 + 3).to.not.equal(4);
  });

  it.only('should be filtered for', () => {
    expect(2 + 2).to.equal(4);
  });

  it.skip('should be filtered out', () => {
    expect(2 + 2).to.equal(4);
  });

  xit('should be filtered out', () => {
    expect(2 + 2).to.equal(4);
  });

  it('should be pending');

  describe('nested describe', () => {

  });
});

describe.only('nested only\'ed describe', () => {

});

describe.skip('nested skipped describe', () => {

});

xdescribe('nested skipped describe', () => {

});
```

### CLI Usage

Simply use the executable provided within `./node_modules/.bin` called `drag-race`:

```sh
./node_modules/.bin/drag-race ./test
```

Or in an npm script:

```json
"scripts": {
  "test": "drag-race ./test"
},
```

```sh
npm test
```

#### Concurrency

By default, all tests will run in parallel with concurrency of `Infinity`. You may set this number by using the `-c` flag:

```sh
drag-race -c 10 ./test
```

### Observers

By default the `console` observer will be used to spit out whether or not tests pass. You may extend the `BaseObserver` class and provide either a module name or a relative path with the `-o`, `--observer` options in the command line. Simply override the super's methods and do whatever logic you want. There is no need to call super's method in the overridden methods.

### License

This software is licensed under [the MIT license](LICENSE.md).
