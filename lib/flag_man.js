'use strict';

const B = require('bluebird');
const Describe = require('./describe');
const EventEmitter = require('events').EventEmitter;
const filter = require('lodash.filter');
const Test = require('./test');

// The full test suite's parent describe - used to contain all describes
const ROOT_DESCRIBE = new Describe({ description: '', fn: null, parent: null });

/**
 * Helper to build a describe marked as only'ed.
 *
 * @param {string} description Describe description string.
 * @param {function} fn Describe function holding tests.
 */
const describeOnly = function(description, fn) {
  this.describe(description, fn, true, false);
};

/**
 * Helper to build a describe marked as skipped.
 *
 * @param {string} description Describe description string.
 * @param {function} fn Describe function holding tests.
 */
const describeSkip = function(description, fn) {
  this.describe(description, fn, false, true);
};

/**
 * Helper to build a test marked as only'ed.
 *
 * @param {string} description Test description string.
 * @param {function} fn Test function holding tests.
 */
const itOnly = function(description, fn) {
  this.it(description, fn, true, false);
};

/**
 * Helper to build a test marked as skipped.
 *
 * @param {string} description Test description string.
 * @param {function} fn Test function holding tests.
 */
const itSkip = function(description, fn) {
  this.it(description, fn, false, true);
};

/**
 * This is the test runner. It emits events when tests begin, start, pending, pass, fail, finish and end.
 */
class FlagMan extends EventEmitter {
  constructor(config) {
    super();

    this.concurrency = Number(config && config.concurrency) || Infinity;

    if (config && config.observer) {
      const Observer = require(config.observer);
      this.observer = new Observer(this);
    }

    // All the describes
    this.describes = [];

    // All the tests
    this.tests = [];

    // The current describe being built - used for building out the full test suite
    this.currentDescribe = ROOT_DESCRIBE;

    // Helper methods to build describes and tests marked as only'ed or skipped
    this.describe.only = describeOnly.bind(this);
    this.describe.skip = describeSkip.bind(this);
    this.it.only = itOnly.bind(this);
    this.it.skip = itSkip.bind(this);
  }

  /**
   * Starts the tests.
   *
   * @returns {Promise}
   */
  go() {
    // Only run tests marked as only'ed
    let tests = filter(this.tests, 'only');

    // No only's found so run all tests
    if (tests.length === 0) {
      tests = this.tests;
    }

    // Beginning all tests so emit the `begin` event
    this.emit('begin');

    // Run tests
    return B.map(tests, (test) => {
      // If the test is marked to be skipped, emit the `pending` event and skip
      if (test.skip) {
        return this.emit('pending', test);
      }

      // Starting test
      this.emit('start', test);

      // Execute the test
      return test.execute()

        // If no errors are thrown emit the `pass` event, otherwise emit the `fail` event
        .then(() => this.emit('pass', test), (err) => {
          test.error = err;
          this.emit('fail', test);
        })

        // After the test passes/fails emit the `finish` event
        .finally(() => this.emit('finish', test))
        .return(test);
    }, { concurrency: this.concurrency })

    // Run the after hooks
    .then(() => B.map(this.describes, (describe) => describe.clean()))

    // All tests are done so emit the `end` event
    .finally(() => this.emit('end'));
  }

  /**
   * Builds a normal describe.
   *
   * @param {string} description Describe description string.
   * @param {function} fn Describe function holding tests.
   * @param {boolean} only Mark describe block as only'ed.
   * @param {boolean} skip Mark describe block to be skipped.
   */
  describe(description, fn, only, skip) {
    // Build describe
    const describe = new Describe({ description, fn, parent: this.currentDescribe });
    describe.only = Boolean(only);
    describe.skip = Boolean(skip);

    // Save describe
    this.describes.push(describe);
    this.currentDescribe = describe;

    // Call the describe's given function to collect tests
    if (typeof fn === 'function') {
      fn();
    }

    // Reset
    this.currentDescribe = describe.parent;
  }

  /**
   * Builds a describe marked to be skipped.
   *
   * @param {string} description Describe description string.
   * @param {function} fn Describe function holding tests.
   */
  xdescribe(description, fn) {
    this.describe(description, fn, false, true);
  }

  /**
   * The before hook in a describe.
   *
   * @param {function} fn Function to be called before all tests in a describe block.
   */
  before(fn) {
    this.currentDescribe.before = fn;
  }

  /**
   * The beforeEach hook in a describe.
   *
   * @param {function} fn Function to be called before each test in a describe block.
   */
  beforeEach(fn) {
    this.currentDescribe.beforeEach = fn;
  }

  /**
   * Builds a test.
   *
   * @param {string} description Test description string.
   * @param {function} fn Function to be called as a test.
   * @param {boolean} only Mark test as only'ed.
   * @param {boolean} skip Mark test to be skipped.
   */
  it(description, fn, only, skip) {
    // Build test
    const test = new Test({ description, fn, describe: this.currentDescribe });
    test.only = Boolean(only);
    test.skip = Boolean(skip);

    // Save test
    this.tests.push(test);
  }

  /**
   * Builds a test marked as skipped.
   *
   * @param {string} description Test description string.
   * @param {function} fn Function to be called as a test.
   */
  xit(description, fn) {
    this.it(description, fn, false, true);
  }

  /**
   * The afterEach hook in a describe.
   *
   * @param {function} fn Function to be called after each test in a describe block.
   */
  afterEach(fn) {
    this.currentDescribe.afterEach = fn;
  }

  /**
   * The after hook in a describe.
   *
   * @param {function} fn Function to be called after all tests in a describe block.
   */
  after(fn) {
    this.currentDescribe.after = fn;
  }

  /**
   * Provide an instantiation of an observer. Must extend the BaseObserver class.
   *
   * @param {object} observer A BaseObserver subclass.
   */
  useObserver(observer) {
    this.observer = observer;
  }
}

/**
 * @module
 * @type {FlagMan}
 */
module.exports = FlagMan;
