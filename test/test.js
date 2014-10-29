var assert = require('assert');
var co = require('co');

var ay = require('../index.js');

function sleep(ms) {
    return function(done) {
        setTimeout(function() { done(); }, ms);
    };
}

describe('ay', function() {
    describe('results', function() {
        it('should work the same as ordinary array methods', co(function* () {
            var a, b,
                nums = [1, 2, 3, 4, 5],
                val = 2,
                thisArg = { val: val, nums: nums };

            assert.deepEqual(
                nums.map( function (i) {
                    return i * val;
                } ),
                yield ay(nums).map( function *(i) {
                    yield sleep(10);
                    return i * val;
                } ),
                'map'
            );

            assert.deepEqual(
                nums.map( function (i) {
                    return i * this.val;
                }, thisArg ),
                yield ay(nums).map( function *(i) {
                    yield sleep(10);
                    return i * this.val;
                }, thisArg ),
                'map with thisArg'
            );

            assert.deepEqual(
                nums.filter( function (i) {
                    return i > val;
                } ),
                yield ay(nums).filter( function *(i) {
                    yield sleep(10);
                    return i > val;
                } ),
                'filter'
            );

            assert.deepEqual(
                nums.filter( function (i) {
                    return i > this.val;
                }, thisArg ),
                yield ay(nums).filter( function *(i) {
                    yield sleep(10);
                    return i > this.val;
                }, thisArg ),
                'filter with thisArg'
            );

            assert.equal(
                nums.reduce( function (a, b) {
                    return a + b;
                } ),
                yield ay(nums).reduce( function *(a, b) {
                    yield sleep(10);
                    return a + b;
                } ),
                'reduce'
            );

            assert.equal(
                nums.reduce( function (a, b) {
                    return a + b;
                }, val ),
                yield ay(nums).reduce( function *(a, b) {
                    yield sleep(10);
                    return a + b;
                }, val ),
                'reduce with initial value'
            );

            assert.equal(
                nums.reduceRight( function (a, b) {
                    return a + b;
                } ),
                yield ay(nums).reduceRight( function *(a, b) {
                    yield sleep(10);
                    return a + b;
                } ),
                'reduceRight'
            );

            assert.equal(
                nums.reduceRight( function (a, b) {
                    return a + b;
                }, val ),
                yield ay(nums).reduceRight( function *(a, b) {
                    yield sleep(10);
                    return a + b;
                }, val ),
                'reduceRight with initial value'
            );

            assert.equal(
                nums.every( function (i) {
                    return nums.indexOf( i ) !== -1;
                } ),
                yield ay(nums).every( function *(i) {
                    yield sleep(10);
                    return nums.indexOf( i ) !== -1;
                } ),
                'every'
            );

            assert.equal(
                nums.every( function (i) {
                    return this.nums.indexOf( i ) !== -1;
                }, thisArg ),
                yield ay(nums).every( function *(i) {
                    yield sleep(10);
                    return this.nums.indexOf( i ) !== -1;
                }, thisArg ),
                'every with thisArg'
            );

            assert.equal(
                nums.some( function (i) {
                    return i === val;
                } ),
                yield ay(nums).some( function *(i) {
                    yield sleep(10);
                    return i === val;
                } ),
                'some'
            );

            assert.equal(
                nums.some( function (i) {
                    return i === this.val;
                }, thisArg ),
                yield ay(nums).some( function *(i) {
                    yield sleep(10);
                    return i === this.val;
                }, thisArg ),
                'some with thisArg'
            );

            a = 0;
            b = 0;
            nums.forEach( function (i) {
                a += i * val;
            } );
            yield ay(nums).forEach( function *(i) {
                yield sleep(10);
                b += i * val;
            } );
            assert.equal(a, b, 'forEach');

            a = 0;
            b = 0;
            nums.forEach( function (i) {
                a += i * this.val;
            }, thisArg );
            yield ay(nums).forEach( function *(i) {
                yield sleep(10);
                b += i * this.val;
            }, thisArg );
            assert.equal(a, b, 'forEach with thisArg');

        }));
    });
    describe('chaining', function() {
        it('should work the same as ordinary array methods', co(function* () {

            var nums = [1, 2, 3, 4, 5];

            var result1 = nums
                .map(function (i) {
                    return i * 2;
                })
                .filter(function (i) {
                    return i > 2;
                })
                .reduce(function (a, b) {
                    return a + b;
                }, 6);

            assert.equal(34, result1);

            var result2 = yield ay(nums)
                .map(function* (i) {
                    yield sleep(10);
                    return i * 2;
                })
                .filter(function* (i) {
                    yield sleep(10);
                    return i > 2;
                })
                .reduce(function* (a, b) {
                    yield sleep(10);
                    return a + b;
                }, 6);

            assert.equal(result2, result1);
        }));

        it('should support non-callback methods trivially', co(function* () {

            var moreNums = (yield ay([1, 2, 3])
                .map(function* (i) {
                    yield sleep(10);
                    return i * 2;
                }))
                .concat([10, 20, 30]);

            assert.deepEqual([2, 4, 6, 10, 20, 30], moreNums);
        }));
    });
});
