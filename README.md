# Passport-42

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [42](https://api.intra.42.fr/apidoc) using the OAuth 2.0 API.

This module lets you authenticate using 42 in your Node.js applications.
By plugging into Passport, 42 authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-42

## Usage

#### Configure Strategy

The 42 authentication strategy authenticates users using a 42 account and OAuth
2.0 tokens.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user, as well as `options` specifying
a client ID, client secret, and callback URL.

    passport.use(new FortyTwoStrategy({
        clientID: FORTYTWO_CLIENT_ID,
        clientSecret: FORTYTWO_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/42/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ fortytwoId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'42'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/42',
      passport.authenticate('42'));

    app.get('/auth/42/callback',
      passport.authenticate('42', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/pandark/passport-42/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://travis-ci.org/pandark/passport-42.svg?branch=master)](https://travis-ci.org/pandark/passport-42)

## Credits

  - [Adrien "Pandark" Pachkoff](http://github.com/pandark)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Adrien "Pandark" Pachkoff <[https://lifeleaks.com/](https://lifeleaks.com/)>
