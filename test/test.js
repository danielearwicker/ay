var assert = require('assert');
var co = require('co');

var ay = require('../index.js');

function sleep(ms) {
    return function(done) {
        setTimeout(function() { done(); }, ms);
    };
}

describe('ay', function() {
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
                });

            assert.equal(28, result1);

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
                });
            
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
