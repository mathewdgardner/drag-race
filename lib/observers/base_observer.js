'use strict';

/**
 * Extend this class and override its methods to receive events by the same name.
 */
class BaseObserver {
  constructor(flagMan) {
    flagMan.on('begin', this.begin.bind(this));
    flagMan.on('start', this.start.bind(this));
    flagMan.on('pending', this.pending.bind(this));
    flagMan.on('retry', this.retry.bind(this));
    flagMan.on('pass', this.pass.bind(this));
    flagMan.on('fail', this.fail.bind(this));
    flagMan.on('finish', this.finish.bind(this));
    flagMan.on('end', this.end.bind(this));

    this.flagMan = flagMan;
  }

  /**
   * Override this method. Called when all tests start.
   */
  begin() {}

  /**
   * Override this method. Called when each unskipped test starts.
   */
  start() {}

  /**
   * Override this method. Called when a test is skipped.
   */
  pending() {}

  /**
   * Override this method. Called when a test is retried.
   */
  retry() {}

  /**
   * Override this method. Called after a test passes.
   */
  pass() {}

  /**
   * Override this method. Called after a test fails.
   */
  fail() {}

  /**
   * Override this method. Called after each unskipped test finishes.
   */
  finish() {}

  /**
   * Override this method. Called after all tests finish.
   */
  end() {}
}

/**
 * @module
 * @type {BaseObserver}
 */
module.exports = BaseObserver;
