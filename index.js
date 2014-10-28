var co = require('co');

var prototype = {
    map: function(gen, thisArg ) {
        var self = this;
        return ay(function*() {
            var ar = yield self.generate(),
                len = ar.length >>> 0,
                result = new Array(len);
            for (var i = 0; i < len; i++) {
                if (i in ar) {
                    result[i] = yield gen.call(thisArg, ar[i], i, ar);
                }
            }
            return result;
        });
    },
    filter: function(gen, thisArg) {
        var self = this;
        return ay(function*() {
            var ar = yield self.generate(),
                len = ar.length >>> 0,
                result = [];
            for (var i = 0; i < len; i++) {
                if (i in ar && (yield gen.call(thisArg, ar[i], i, ar))) {
                    result.push(ar[i]);
                }
            }
            return result;
        });
    },
    reduce: function(gen, init) {
        var self = this;
        return ay(function*() {
            var ar = yield self.generate(), len = ar.length >>> 0, k = 0, value;
            if (init !== undefined) {
                value = init;
            } else {
                while (k < len && !(k in ar)) k++;
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = ar[k++];
            }
            for (; k < len; k++) {
                if (k in ar) {
                    value = yield gen(value, ar[k], k, ar);
                }
            }
            return value;
        });
    },
    reduceRight: function(gen, init) {
        var self = this;
        return ay(function*() {
            var ar = yield self.generate(), len = ar.length >>> 0, k = len - 1, value;
            if (init !== undefined) {
                value = init;
            } else {
                while (k >= 0 && !(k in ar )) k--;
                if (k < 0) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = ar[k--];
            }
            for (; k >= 0; k--) {
                if (k in ar) {
                    value = yield gen(value, ar[k], k, ar);
                }
            }
            return value;
        });
    },
    every: function(gen, thisArg) {
        var self = this;
        return ay(function*() {
            var ar = yield self.generate(), len = ar.length >>> 0;
            for (var i = 0; i < len; i++) {
                if ((i in ar) && !(yield gen.call(thisArg, ar[i], i, ar))) {
                    return false;
                }
            }
            return true;
       });
    },
    some: function(gen, thisArg) {
        var self = this;
        return ay(function*() {
            var ar = yield self.generate(), len = ar.length >>> 0;
            for (var i = 0; i < len; i++) {
                if ((i in ar) && (yield gen.call(thisArg, ar[i], i, ar))) {
                    return true;
                }
            }
            return false;
        });
    },
    forEach: function(gen, thisArg) {
        var self = this;
        return ay(function*() {
            var ar = yield self.generate(), len = ar.length >>> 0;
            for (var i = 0; i < len; i++) {
                if (i in ar) {
                    yield gen.call(thisArg, ar[i], i, ar);
                }
            }
        });
    },
    then: function(done, fail) {
        co(this.generate())(function(err, val) {
            if (err) {
                fail(err);
            } else {
                done(val);
            }
        });
    }
};

var ay = module.exports = function(g) {
    if (typeof g !== 'function') {
        g = g === void 0 ? [] : Array.isArray(g) ? g : [g];
        return ay(function* () { return g; });
    }
    return Object.create(prototype, {
        generate: { value: g }
    });
};
