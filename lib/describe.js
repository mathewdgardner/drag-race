/* eslint-disable consistent-this */

'use strict';

const B = require('bluebird');
const toPromise = require('./util').toPromise;

/**
 * Represents a describe block and is responsible for providing tests with context.
 */
class Describe {
  constructor(config) {
    this._context = null;
    this._description = config.description;
    this._only = false;
    this._skip = false;

    // Parent describe
    this.parent = config.parent;

    // Ancestors' hooks
    this.beforeEaches = null;
    this.afterEaches = null;

    // Hooks
    this.before = null;
    this.beforeEach = null;
    this.afterEach = null;
    this.after = null;
  }

  /**
   * Getter for the {Describe}'s description string including its parent {Describe}'s description.
   *
   * @returns {string} Description string
   */
  get description() {
    const str = this.parent ? `${this.parent.description} ${this._description}` : this._description;

    return str.trim();
  }

  /**
   * Getter for determining if tests in this {Describe} are marked as only'ed.
   *
   * @returns {boolean}
   */
  get only() {
    return this.parent && this.parent.only || this._only;
  }

  /**
   * Setter for marking this {Describe} as only'ed.
   *
   * @param {boolean} val
   */
  set only(val) {
    this._only = val;
  }

  /**
   * Getter for determining if tests in this {Describe} are marked as skipped.
   *
   * @returns {boolean}
   */
  get skip() {
    return this.parent && this.parent.skip || this._skip;
  }

  /**
   * Setter for marking this {Describe} as skipped.
   *
   * @param {boolean} val
   */
  set skip(val) {
    this._skip = val;
  }

  /**
   * Provides context from the before hook.
   *
   * @returns {Promise}
   */
  beforeContext() {
    if (!this._context) {
      const parentContext = this.parent ? this.parent.context() : B.resolve({});

      // Get the context from the before hooks
      this._context = parentContext.then((context) => {
        const clonedContext = Object.assign({}, context);

        if (this.before) {
          return toPromise(clonedContext, this.before)
            .return(clonedContext);
        }

        return clonedContext;
      });
    }

    return this._context;
  }

  /**
   * Provides context from each tests' beforeEach hook.
   *
   * @param {object} beforeContext The context from the before hook.
   * @returns {Promise}
   */
  beforeEachContext(beforeContext) {
    if (!this.beforeEaches) {
      this.beforeEaches = [];
      let describe = this;

      // Get the beforeEach hooks
      while (describe) {
        if (describe.beforeEach) {
          this.beforeEaches.unshift(describe.beforeEach);
        }

        describe = describe.parent;
      }
    }

    // Run the beforeEach hooks and return context
    return B.reduce(this.beforeEaches, (context, beforeEach) => {
      return toPromise(context, beforeEach)
        .return(context);
    }, Object.assign({}, beforeContext));
  }

  /**
   * Provides a context object on request.
   *
   * @returns {Promise}
   */
  context() {
    return this.beforeContext()
      .then(this.beforeEachContext.bind(this));
  }

  /**
   * Run the afterEach hook in a given context.
   *
   * @param {object} context A {Test}'s context
   * @returns {Promise}
   */
  applyAfterEach(context) {
    if (!this.afterEaches) {
      this.afterEaches = [];
      let describe = this;

      // Get the afterEach hooks
      while (describe) {
        if (describe.afterEach) {
          this.afterEaches.push(describe.afterEach);
        }

        describe = describe.parent;
      }
    }

    // Run the afterEach hooks
    return B.each(this.afterEaches, (afterEach) => toPromise(context, afterEach));
  }

  /**
   * Run the after hooks.
   *
   * @returns {Promise}
   */
  clean() {
    const afters = [];

    let describe = this;

    // Find all the after hooks
    while (describe) {
      if (describe.after) {
        afters.push(describe.after);
      }

      describe = describe.parent;
    }

    // Run all the after hooks
    if (afters.length && this._context) {
      return this._context.then((context) => {
        return B.each(afters, (after) => toPromise(context, after));
      });
    }

    return B.resolve();
  }
}

/**
 * @module
 * @type {Describe}
 */
module.exports = Describe;
