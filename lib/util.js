'use strict';

const B = require('bluebird');

/**
 * Helper to either try a promise or a callback, but always return a promise.
 *
 * @param {object} context A context to run in.
 * @param {function} fn A function to call.
 * @returns {Promise}
 */
exports.toPromise = (context, fn) => {
  return fn.length > 1
    ? B.fromCallback(fn.bind(context, context))
    : B.try(fn.bind(context, context));
};
