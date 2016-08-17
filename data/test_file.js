'use strict';

const expect = require('chai').expect;

describe('test', () => {
  before(() => {
//    console.log('before');
  });

  beforeEach(() => {
//    console.log('beforeEach');
  });

  afterEach(() => {
//    console.log('afterEach');
  });

  after(() => {
//    console.log('after');
  });

  it('should pass', () => {
    expect(1).to.equal(1);
  });
});
