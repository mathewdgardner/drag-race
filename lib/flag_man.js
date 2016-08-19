'use strict';

const B = require('bluebird');
const Describe = require('./describe');
const EventEmitter = require('events').EventEmitter;
const filter = require('lodash.filter');
const flattenDeep = require('lodash.flattendeep');
const fs = require('fs');
const glob = B.promisify(require('glob'));
const get = require('lodash.get');
const Test = require('./test');

// The full test suite's parent describe - used to contain all describes
const ROOT_DESCRIBE = new Describe({ description: '', fn: null, parent: null });

// The global functions that will be set
const GLOBAL_FUNCS = [
  'describe',
  'xdescribe',
  'odescribe',
  'before',
  'beforeEach',
  'it',
  'xit',
  'oit',
  'afterEach',
  'after'
];

/**
 * This is the test runner. It emits events when tests begin, start, pending, pass, fail, finish and end.
 */
class FlagMan extends EventEmitter {
  constructor(config) {
    super();

    this.concurrency = Number(config && config.concurrency) || Infinity;

    if (get(config, 'observer', null)) {
      const Observer = require(config.observer);
      this.observer = new Observer(this);
    }

    this._maxRetry = parseInt(get(config, 'maxRetry', 0));

    // All the test files
    this._files = [];

    // All the describes
    this.describes = [];

    // All the tests
    this.tests = [];

    // The current describe being built - used for building out the full test suite
    this.currentDescribe = ROOT_DESCRIBE;

    // Helper methods to build describes and tests marked as only'ed or skipped
    this.describe.only = this.odescribe.bind(this);
    this.describe.skip = this.xdescribe.bind(this);
    this.it.only = this.oit.bind(this);
    this.it.skip = this.xit.bind(this);
  }

  /**
   * Loads given test files.
   *
   * @param {array} files File or directory paths.
   */
  getSet(files) {
    // Find test files and start tests.
    return B.map(files, (fileOrDir) => {
      const stat = fs.statSync(fileOrDir);

      if (stat.isDirectory()) {
        // Get all test file paths in directory
        return glob(`${fileOrDir}/**/*.js`, { realpath: true });
      } else if (stat.isFile() && fileOrDir.match(/.+\.js$/)) {
        // Get test file path
        return fs.realpathSync(fileOrDir);
      }

      throw new Error('Only files and directories are allowed.');
    })

    // Flatten the files into one array
    .then(flattenDeep)

    // Remember the real paths of the test files so we can delete the require cache later
    .tap((realPaths) => (this._files = realPaths))

    // Require all the test files
    .map(require);
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

    const execute = (test) => {
      // Execute the test
      return test.execute()

        // If no errors are thrown emit the `pass` event, otherwise emit the `fail` event
        .then(() => this.emit('pass', test), () => {
          this.emit('fail', test);

          if (test.retries < this._maxRetry) {
            test.retries += 1;
            this.emit('retry', test);

            return execute(test);
          }

          return null;
        });
    };

    // Run tests
    return B.map(tests, (test) => {
      // If the test is marked to be skipped, emit the `pending` event and skip
      if (test.skip) {
        return this.emit('pending', test);
      }

      // Starting test
      this.emit('start', test);

      // Execute test and retry if eligible
      return execute(test)

        // After the test passes/fails emit the `finish` event
        .finally(() => this.emit('finish', test))
        .return(test);
    }, { concurrency: this.concurrency })

    // Run the after hooks
    .then(() => B.map(this.describes, (describe) => describe.clean()))

    // All tests are done so emit the `end` event
    .finally(() => {
      this.emit('end');

      return B.map(this._files, (file) => delete require.cache[file]);
    });
  }

  /**
   * Builds a normal describe.
   *
   * @param {string} description Describe description string.
   * @param {function} fn Describe function holding tests.
   */
  describe(description, fn) {
    // Build describe
    const describe = new Describe({ description, fn, parent: this.currentDescribe });

    // Save describe
    this.describes.push(describe);
    this.currentDescribe = describe;

    // Call the describe's given function to collect tests
    if (typeof fn === 'function') {
      fn();
    }

    // Reset
    this.currentDescribe = describe.parent;

    return describe;
  }

  /**
   * Builds a describe marked to be skipped.
   *
   * @param {string} description Describe description string.
   * @param {function} fn Describe function holding tests.
   */
  xdescribe(description, fn) {
    const describe = this.describe(description, fn);
    describe.skip = true;

    return describe;
  }

  /**
   * Builds a describe marked to be marked as only'ed.
   *
   * @param {string} description Describe description string.
   * @param {function} fn Describe function holding tests.
   */
  odescribe(description, fn) {
    const describe = this.describe(description, fn);
    describe.only = true;

    return describe;
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
   */
  it(description, fn) {
    const test = new Test({ description, fn, describe: this.currentDescribe });
    this.tests.push(test);

    return test;
  }

  /**
   * Builds a test marked as skipped.
   *
   * @param {string} description Test description string.
   * @param {function} fn Function to be called as a test.
   */
  xit(description, fn) {
    const test = this.it(description, fn);
    test.skip = true;

    return test;
  }

  /**
   * Builds a test marked as only'ed.
   *
   * @param {string} description Test description string.
   * @param {function} fn Function to be called as a test.
   */
  oit(description, fn) {
    const test = this.it(description, fn);
    test.only = true;

    return test;
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

  /**
   * Set global functions, such as decribe and it.
   */
  makeGlobal() {
    GLOBAL_FUNCS.forEach((funcName) => {
      global[funcName] = this[funcName].bind(this);
    });

    global.describe.only = this.odescribe.bind(this);
    global.describe.skip = this.xdescribe.bind(this);
    global.it.only = this.oit.bind(this);
    global.it.skip = this.xit.bind(this);
  }

  /**
   * Remove functions from global.
   */
  removeGlobal() {
    GLOBAL_FUNCS.forEach((funcName) => {
      delete global[funcName];
    });
  }
}

/**
 * @module
 * @type {FlagMan}
 */
module.exports = FlagMan;
