/* eslint-disable no-console */

'use strict';

const chalk = require('chalk');

/**
 * Default observer used when running tests in the command line.
 */
class ConsoleObserver extends require('./base_observer') {
  constructor(runner) {
    super(runner);
  }

  pending(test) {
    console.info(chalk.cyan('  -'), chalk.gray(test.description));
  }

  pass(test) {
    console.info(chalk.green('  \u2713'), chalk.gray(test.description));
  }

  fail(test) {
    console.info(chalk.red('  \u2717'), chalk.gray(test.description));
    console.info(chalk.white(test.error.stack));
  }
}

/**
 * @module
 * @type {ConsoleObserver}
 */
module.exports = ConsoleObserver;
