'use strict';

class CustomObserver extends require('../../lib/observers/base_observer') {
  constructor(flagMan) {
    super(flagMan);
  }

  begin() {
    super.begin();
  }

  start() {
    super.start();
  }

  pending() {
    super.pending();
  }

  pass() {
    super.pass();
  }

  fail() {
    super.fail();
  }

  finish() {
    super.finish();
  }

  end() {
    super.end();
  }
}

module.exports = CustomObserver;
