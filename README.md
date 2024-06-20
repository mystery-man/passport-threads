# Passport-Threads

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating with [Threads](https://www.threads.net) using the OAuth 2.0 API.

This module lets you authenticate using Threads in your Node.js applications. By plugging into Passport, Threads authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/).

## Installation

[![NPM Stats](https://nodei.co/npm/passport-threads.png?downloads=true)](https://npmjs.org/package/passport-threads)

This is a module for node.js and is installed via npm:

``` bash
npm install passport-threads --save
```

## Usage

### Configure Strategy

The Threads authentication strategy authenticates users using a Threads account and OAuth 2.0 tokens. The strategy requires a `verify` callback, which accepts these credentials and calls `done` providing a user, as well as `options` specifying a client ID, client secret, scope, and callback URL.

``` js
passport.use(new ThreadsStrategy({
        clientID: THREADS_CLIENT_ID,
        clientSecret: THREADS_CLIENT_SECRET,
        scope: ['user.info.basic'],
        callbackURL: "https://localhost:3000/auth/threads/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ threadsId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));
```

**Threads only allows https callback urls.** [This blog article](http://blog.mgechev.com/2014/02/19/create-https-tls-ssl-application-with-express-nodejs/) explains the quickest way to enable https for your Express server.

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'threads'` strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/) application:

``` js
app.get('/auth/threads',
    passport.authenticate('threads')
);

app.get('/auth/threads/callback', 
    passport.authenticate('threads', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);
```
### Versions
By default we are using version 1.0. If other version is required it can be used like the following example.

``` js
passport.use(new ThreadsStrategy({
        version: "v1.0",
        clientID: THREADS_CLIENT_ID,
        clientSecret: THREADS_CLIENT_SECRET,
        scope: ['threads_basic'],
        callbackURL: "https://localhost:3000/auth/threads/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ threadsId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));
```

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.
