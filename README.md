## ay

Chainable array operations suitable for use inside coroutine generators (NB. this is NOT about lazy list transformation!)

The **a** is for array, the **y** is for yield.

## Installation

[![NPM](https://nodei.co/npm/ay.png)](https://nodei.co/npm/ay/)

In a generator being driven by something like [co](https://github.com/visionmedia/co) such as a [koa](http://koajs.com) route or middleware, you may want to work on an array with the standard ES Array methods: `forEach`, `map`, `reduce`, `every`, `some`, `reduce`, `reduceRight`.

This is fine except that you may also want to call one or more asynchronous helpers or APIs from within the callback you pass to the array method. For maximum clarity you'd like to use `yield` in the usual way. But the array methods don't accept a generator - only an ordinary function.

Example:

    app.get('/users', function* () {
        var userIds = yield data.getUserIds();
        this.body = userIds.map(function(userId) {
            // THIS DOESN'T WORK
            return data.getUserInfo(userId);
        });
    });

The call to `data.getUserInfo` needs to return an object describing a user. But it's asynchronous, so it actually returns a thunk, a promise, a generator, etc.

Using `ay`, we can wrap an ordinary array in an object that has the same callback-taking methods, but they take generators instead of ordinary functions:

    var ay = require('ay');
    
    app.get('/users', function* () {
        var userIds = yield data.getUserIds();
        this.body = yield ay(userIds).map(function* (userId) {
            return yield data.getUserInfo(userId);  
        });
    });

The `map` function returns another `ay` wrapper, so further calls can be chained. An `ay` wrapper can be yielded to get the resulting array (it is "thenable", so mimics a promise sufficiently for `co`). This has the effect of "transmitting" the `yield`s inside the callback to the outer context so they can be managed by the coroutine runner.

An chaining example, assuming an async `sleep` function:

    var num = yield ay(nums)
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

Due to the high precedence of `yield`, it applies to the entire `ay`-expression and so the result of `reduce` is `yield`ed.

Note that only the standard array methods that accept a callback are included. For other methods you can easily `yield` to get an ordinary array - note the placement of the parentheses:

    var moreNums = (yield ay(nums)
        .map(function* (i) {
            yield sleep(10);
            return i * 2;
        }))
        .concat([10, 20, 30]);

A real example using `forEach, from [bitstupid.com](https://github.com/danielearwicker/bitstupid):

    app.get('/bits/:of', function* () {
        var bit = yield data.readBit(
            this.params.of.toLowerCase(), 
            this.query.skip, 
            this.query.take);

        yield ay(bit.changes).forEach(function* (change) {
            change.info = yield data.getInfo(change.by);
        });

        this.body = bit;
    });
