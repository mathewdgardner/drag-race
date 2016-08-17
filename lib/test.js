'use strict';

const toPromise = require('./util').toPromise;

/**
 * Represents a test.
 */
class Test {
  constructor(config) {
    this._description = config.description;
    this._error = null;
    this._only = false;
    this._skip = false;

    this.describe = config.describe;
    this.fn = config.fn;
  }

  /**
   * Getter for the {Test}'s description string including its parent {Describe}'s description.
   *
   * @returns {string} Description string
   */
  get description() {
    return `${this.describe.description} ${this._description}`.trim();
  }

  /**
   * Getter for determining if this {Test} is marked as only'ed.
   *
   * @returns {boolean}
   */
  get only() {
    return this.describe.only || this._only;
  }

  /**
   * Setter for marking this {Test} as only'ed.
   *
   * @param {boolean} val
   */
  set only(val) {
    this._only = val;
  }

  /**
   * Getter for determining if tests in this {Test} are marked as skipped.
   *
   * @returns {boolean}
   */
  get skip() {
    return this.describe.skip || this._skip || !this.fn;
  }

  /**
   * Setter for marking this {Test} as skipped.
   *
   * @param {boolean} val
   */
  set skip(val) {
    this._skip = val;
  }

  /**
   * Getter for determining if tests in this {Test} are marked as skipped.
   *
   * @returns {boolean}
   */
  get error() {
    return this._error;
  }

  /**
   * Get a context and start the test.
   *
   * @returns {Promise}
   */
  execute() {
    return this.describe.context()

      // Run the test's function
      .tap(this.perform.bind(this))

      // Run the afterEach hook
      .then(this.describe.applyAfterEach.bind(this.describe))
      .catch((err) => {
        this._error = err;
        throw err;
      });
  }

  /**
   * Call the test function.
   *
   * @param context
   */
  perform(context) {
    return toPromise(context, this.fn);
  }
}

/**
 * @module
 * @type {Test}
 */
module.exports = Test;
