## ay

Chainable array operations suitable for use inside coroutine generators (NB. this is NOT about lazy list transformation!)

**a**rray + **y**ield

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
        var userIds = yield data.getUserIds(); // array of IDs
        
        this.body = yield ay(userIds).map(function* (userId) {
            
            return yield data.getUserInfo(userId);
            
        }).generate();
    });

The `map` function returns another `ay` wrapper, so further calls can be chained. The `generate` method allows you to get at the resulting array, and is itself a generator, so the whole expression begins with a `yield`. This has the effect of "transmitting" the `yield`s inside the callback to the outer context so they can be managed by the coroutine runner.

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
        })
        .generate();

