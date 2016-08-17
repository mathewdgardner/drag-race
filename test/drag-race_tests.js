'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const FlagMan = require('../lib/flag_man');
const fs = require('fs');
const Observer = require('../lib/observers/base_observer');
const sinon = require('sinon');
const suiteFactory = require('./helpers/suite_factory');

describe('drag-race', () => {
  let sandbox;
  let flagMan;
  let observer;
  let beginStub;
  let startStub;
  let pendingStub;
  let retryStub;
  let passStub;
  let failStub;
  let finishStub;
  let endStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    beginStub = sandbox.stub(Observer.prototype, 'begin');
    startStub = sandbox.stub(Observer.prototype, 'start');
    pendingStub = sandbox.stub(Observer.prototype, 'pending');
    retryStub = sandbox.stub(Observer.prototype, 'retry');
    passStub = sandbox.stub(Observer.prototype, 'pass');
    failStub = sandbox.stub(Observer.prototype, 'fail');
    finishStub = sandbox.stub(Observer.prototype, 'finish');
    endStub = sandbox.stub(Observer.prototype, 'end');

    flagMan = new FlagMan({ concurrency: 1 });
    observer = new Observer(flagMan);

    flagMan.observer = observer;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should build description strings', () => {
    suiteFactory.withDescriptionStrings(flagMan, 'outer', 'inner', 'test');

    expect(flagMan.tests[0].description).to.equal('outer inner test');
  });

  it('should use an observer', () => {
    const flagman = new FlagMan({ concurrency: 1, observer: '../lib/observers/base_observer' });
    expect(flagman).to.have.property('observer').that.is.instanceOf(Observer);
  });

  it('should allow no observer', () => {
    const flagman = new FlagMan({ concurrency: 1 });
    expect(flagman).to.not.have.property('observer');
  });

  it('should allow no concurrency and default to infinity', () => {
    const flagman = new FlagMan({ concurrency: 0 });
    expect(flagman).to.have.property('concurrency', Infinity);
  });

  it('should default to infinity if a number isn\'t provided', () => {
    const flagman = new FlagMan({ concurrency: 'foo' });
    expect(flagman).to.have.property('concurrency', Infinity);
  });

  it('should use custom observer', () => {
    sandbox.restore();

    const flagman = new FlagMan({ observer: '../test/helpers/custom_observer', maxRetry: 1 });

    expect(flagman).to.have.property('observer').that.is.instanceOf(require('./helpers/custom_observer'));

    suiteFactory.withFailingPromise(flagman);
    suiteFactory.withPassingPromise(flagman);
    suiteFactory.withTestPending(flagman);
    suiteFactory.withTestSkip(flagman);

    return flagman.go();
  });

  it('should use instantiated observer', () => {
    sandbox.restore();

    const flagman = new FlagMan();
    flagman.useObserver(new Observer(flagMan));

    expect(flagman).to.have.property('observer').that.is.instanceOf(Observer);

    suiteFactory.withFailingPromise(flagman);
    suiteFactory.withPassingPromise(flagman);
    suiteFactory.withTestPending(flagman);
    suiteFactory.withTestSkip(flagman);

    return flagman.go();
  });

  it('should get an error', () => {
    sandbox.restore();

    let done = false;
    class TempObserver extends Observer {
      constructor(flagman) {
        super(flagman);
      }

      fail(test) {
        expect(test.error).to.be.instanceOf(Error);
        done = true;
      }
    }

    const flagman = new FlagMan();
    flagman.useObserver(new TempObserver(flagman));

    suiteFactory.withFailingPromise(flagman);

    return flagman.go()
      .then(() => {
        expect(done).to.be.true;
      });
  });

  describe('with promises', () => {
    it('should pass a test', () => {
      suiteFactory.withPassingPromise(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should pass a test with hooks', () => {
      suiteFactory.withPassingPromiseWithHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test', () => {
      suiteFactory.withFailingPromise(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test with hooks', () => {
      suiteFactory.withFailingPromiseWithHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with callbacks', () => {
    it('should pass a test', () => {
      suiteFactory.withPassingCallback(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should pass a test with hooks', () => {
      suiteFactory.withPassingCallbackWithHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test', () => {
      suiteFactory.withFailingCallback(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test with hooks', () => {
      suiteFactory.withFailingCallbackWithHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with procedurals', () => {
    it('should pass a test', () => {
      suiteFactory.withPassingProcedural(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should pass a test with hooks', () => {
      suiteFactory.withPassingProceduralWithHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test', () => {
      suiteFactory.withFailingProcedural(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test with hooks', () => {
      suiteFactory.withFailingProceduralWithHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with pending', () => {
    it('should skip a test without a function', () => {
      suiteFactory.withTestPending(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 0);
          expect(pendingStub).to.have.property('callCount', 1);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 0);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should skip a test via skip', () => {
      suiteFactory.withTestSkip(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 0);
          expect(pendingStub).to.have.property('callCount', 2);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 0);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should skip a describe without a function', () => {
      suiteFactory.withDescribePending(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 0);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 0);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should skip tests within a skipped describe', () => {
      suiteFactory.withDescribeSkipped(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 0);
          expect(pendingStub).to.have.property('callCount', 2);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 0);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with only', () => {
    it('should run only one test', () => {
      suiteFactory.withTestOnly(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should run all only tests', () => {
      suiteFactory.withTestMultipleOnly(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 2);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 2);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 2);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should only run tests within only describe', () => {
      suiteFactory.withDescribeOnly(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 3);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 3);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 3);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should only run tests within only describe and other only tests', () => {
      suiteFactory.withDescribeOnlyAndTestOnly(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 4);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 4);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 4);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with global hooks', () => {
    it('should pass a test', () => {
      suiteFactory.withPassingGlobalHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test', () => {
      suiteFactory.withFailingGlobalHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with nested hooks', () => {
    it('should pass a test', () => {
      suiteFactory.withPassingNestedHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test', () => {
      suiteFactory.withFailingNestedHooks(flagMan);

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with nested describes', () => {
    it('should pass a test', () => {
      suiteFactory.withPassingNestedDescribes(flagMan, 'foo', 'bar', 'baz', 'test');

      expect(flagMan.tests[0].description).to.equal('foo bar baz test');

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });

    it('should fail a test', () => {
      suiteFactory.withPassingNestedDescribes(flagMan, 'foo', 'bar', 'baz', 'test');

      expect(flagMan.tests[0].description).to.equal('foo bar baz test');

      return flagMan.go()
        .then(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(passStub).to.have.property('callCount', 1);
          expect(failStub).to.have.property('callCount', 0);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });

  describe('with globals', () => {
    it('should set global functions', () => {
      flagMan.makeGlobal();

      expect(global.describe).to.be.a('function');
      expect(global.xdescribe).to.be.a('function');
      expect(global.odescribe).to.be.a('function');
      expect(global.before).to.be.a('function');
      expect(global.beforeEach).to.be.a('function');
      expect(global.it).to.be.a('function');
      expect(global.xit).to.be.a('function');
      expect(global.oit).to.be.a('function');
      expect(global.afterEach).to.be.a('function');
      expect(global.after).to.be.a('function');
    });

    it('should unset global functions', () => {
      flagMan.makeGlobal();
      flagMan.removeGlobal();

      expect(global.describe).to.not.be.a('function');
      expect(global.xdescribe).to.not.be.a('function');
      expect(global.odescribe).to.not.be.a('function');
      expect(global.before).to.not.be.a('function');
      expect(global.beforeEach).to.not.be.a('function');
      expect(global.it).to.not.be.a('function');
      expect(global.xit).to.not.be.a('function');
      expect(global.oit).to.not.be.a('function');
      expect(global.afterEach).to.not.be.a('function');
      expect(global.after).to.not.be.a('function');
    });
  });

  describe('with test files', () => {
    it('should load a test file', () => {
      flagMan.makeGlobal();

      const module = _.find(Object.keys(require.cache), (cache) => /^.*test_file\.js$/.test(cache));
      delete require.cache[module];

      return flagMan.getSet([ './data/test_file.js' ])
        .then(() => flagMan.go())
        .then(() => {
          expect(flagMan.describes).to.have.lengthOf(1);
          expect(flagMan.tests).to.have.lengthOf(1);
        });
    });

    it('should load a test directory', () => {
      flagMan.makeGlobal();

      const module = _.find(Object.keys(require.cache), (cache) => /^.*test_file\.js$/.test(cache));
      delete require.cache[module];

      return flagMan.getSet([ './data' ])
        .then(() => flagMan.go())
        .then(() => {
          expect(flagMan.describes).to.have.lengthOf(1);
          expect(flagMan.tests).to.have.lengthOf(1);
        });
    });

    it('should not load a test file or directory if it does not exist', () => {
      sandbox.stub(fs, 'statSync', () => {
        return {
          isDirectory: () => false,
          isFile: () => false
        };
      });

      return flagMan.getSet([ 'asdf.js' ])
        .then(() => {
          throw Error('should not get here');
        })
        .catch((err) => {
          expect(err.message).to.equal('Only files and directories are allowed.');
          expect(flagMan.describes).to.have.lengthOf(0);
          expect(flagMan.tests).to.have.lengthOf(0);
        });
    });
  });

  describe('with retries', () => {
    it('should retry a failing test', () => {
      const flagman = new FlagMan({ concurrency: 1, maxRetry: 1 });
      flagman.useObserver(new Observer(flagman));
      suiteFactory.withFailingPromise(flagman);

      return flagman.go()
        .catch(() => {
          expect(beginStub).to.have.property('callCount', 1);
          expect(startStub).to.have.property('callCount', 1);
          expect(pendingStub).to.have.property('callCount', 0);
          expect(retryStub).to.have.property('callCount', 1);
          expect(passStub).to.have.property('callCount', 0);
          expect(failStub).to.have.property('callCount', 1);
          expect(finishStub).to.have.property('callCount', 1);
          expect(endStub).to.have.property('callCount', 1);
        });
    });
  });
});
