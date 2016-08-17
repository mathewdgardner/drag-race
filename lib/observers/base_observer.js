'use strict';

/**
 * Extend this class and override its methods to receive events by the same name.
 */
class BaseObserver {
  constructor(flagMan) {
    flagMan.on('begin', this.begin);
    flagMan.on('start', this.start);
    flagMan.on('pending', this.pending);
    flagMan.on('retry', this.retry);
    flagMan.on('pass', this.pass);
    flagMan.on('fail', this.fail);
    flagMan.on('finish', this.finish);
    flagMan.on('end', this.end);

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
