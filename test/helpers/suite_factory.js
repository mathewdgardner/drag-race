'use strict';

const B = require('bluebird');
const expect = require('chai').expect;

const pass = () => expect(2 + 2).to.equal(4);
const fail = () => expect(2 + 2).to.equal(5);

const applyHooksWithPromise = (flagMan) => {
  flagMan.before(() => B.resolve());
  flagMan.beforeEach(() => B.resolve());
  flagMan.after(() => B.resolve());
  flagMan.afterEach(() => B.resolve());
};

const applyHooksWithCallback = (flagMan) => {
  flagMan.before((context, done) => done());
  flagMan.beforeEach((context, done) => done());
  flagMan.after((context, done) => done());
  flagMan.afterEach((context, done) => done());
};

const applyHooksWithProcedural = (flagMan) => {
  flagMan.before(() => {});
  flagMan.beforeEach(() => {});
  flagMan.after(() => {});
  flagMan.afterEach(() => {});
};

exports.withPassingPromise = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withPassingPromiseWithHooks = (flagMan) => {
  applyHooksWithPromise(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withFailingPromise = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => fail());
    });
  });
};

exports.withFailingPromiseWithHooks = (flagMan) => {
  applyHooksWithPromise(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => fail());
    });
  });
};

exports.withPassingCallback = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', (context, done) => {
      pass();
      done();
    });
  });
};

exports.withPassingCallbackWithHooks = (flagMan) => {
  applyHooksWithCallback(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', (context, done) => {
      pass();
      done();
    });
  });
};

exports.withFailingCallback = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', (context, done) => {
      fail();
      done();
    });
  });
};

exports.withFailingCallbackWithHooks = (flagMan) => {
  applyHooksWithCallback(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', (context, done) => {
      fail();
      done();
    });
  });
};

exports.withPassingProcedural = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      pass();
    });
  });
};

exports.withPassingProceduralWithHooks = (flagMan) => {
  applyHooksWithProcedural(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      pass();
    });
  });
};

exports.withFailingProcedural = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      fail();
    });
  });
};

exports.withFailingProceduralWithHooks = (flagMan) => {
  applyHooksWithProcedural(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      fail();
    });
  });
};

exports.withTestPending = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test');
  });
};

exports.withTestSkip = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it.skip('test', () => pass());
    flagMan.xit('test', () => pass());
  });
};

exports.withDescribePending = (flagMan) => {
  flagMan.describe.skip('describe');
};

exports.withDescribeSkipped = (flagMan) => {
  flagMan.describe.skip('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });

  flagMan.xdescribe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withTestOnly = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it.only('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withTestMultipleOnly = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it.only('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it.only('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withDescribeOnly = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });

  flagMan.describe.only('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withDescribeOnlyAndTestOnly = (flagMan) => {
  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it.only('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });

  flagMan.describe.only('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withDescriptionStrings = (flagMan, foo, bar, test) => {
  flagMan.describe(foo, () => {
    flagMan.describe(bar, () => {
      flagMan.it(test, () => {
        return B.resolve()
          .then(() => pass());
      });
    });
  });
};

exports.withPassingGlobalHooks = (flagMan) => {
  applyHooksWithPromise(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withFailingGlobalHooks = (flagMan) => {
  applyHooksWithPromise(flagMan);

  flagMan.describe('describe', () => {
    flagMan.it('test', () => {
      return B.resolve()
        .then(() => fail());
    });
  });
};

exports.withPassingNestedHooks = (flagMan) => {
  applyHooksWithPromise(flagMan);

  flagMan.describe('describe', () => {
    applyHooksWithPromise(flagMan);

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => pass());
    });
  });
};

exports.withFailingNestedHooks = (flagMan) => {
  applyHooksWithPromise(flagMan);

  flagMan.describe('describe', () => {
    applyHooksWithPromise(flagMan);

    flagMan.it('test', () => {
      return B.resolve()
        .then(() => fail());
    });
  });
};

exports.withPassingNestedDescribes = (flagMan, foo, bar, baz, test) => {
  flagMan.describe(foo, () => {
    flagMan.describe(bar, () => {
      flagMan.describe(baz, () => {
        flagMan.it(test, () => {
          return B.resolve()
            .then(() => pass());
        });
      });
    });
  });
};

exports.withFailingNestedDescribes = (flagMan, foo, bar, baz, test) => {
  flagMan.describe(foo, () => {
    flagMan.describe(bar, () => {
      flagMan.describe(baz, () => {
        flagMan.it(test, () => {
          return B.resolve()
            .then(() => fail());
        });
      });
    });
  });
};
