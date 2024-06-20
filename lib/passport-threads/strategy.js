'use strict';

var isFunction = require('lodash/isFunction'),
    isObjectLike = require('lodash/isObjectLike'),
    isString = require('lodash/isString'),
    isUndefined = require('lodash/isUndefined'),
    util = require('util'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;

var urls = {
    authorizationURL: "https://threads.net/oauth/authorize/",
    tokenURL: "https://graph.threads.net/oauth/access_token",
    profileURL: "https://graph.threads.net/%version%/me/"
}
/**
 * `Strategy` constructor.
 *
 * The Threads authentication strategy authenticates requests by delegating
 * to Threads using the OAuth 2.0 protocol as described here:
 * https://developers.threads.com/doc/login-kit-web
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`         your Threads application's app id
 *   - `clientSecret`      your Threads application's app secret
 *   - `scope`              Scopes allowed for your Threads Application
 *   - `callbackURL`        URL to which Threads will redirect the user after granting authorization
 *
 * Examples:
 *
 *     var threads = require('passport-threads');
 *
 *     passport.use(new threads.Strategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret',
 *         scope: ['threads_basic'],
 *         callbackURL: 'https://www.example.net/auth/threads/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {

    if (!isObjectLike(options)) {
        throw new TypeError('Please pass the options.');
    }

    if (!isFunction(verify)) {
        throw new TypeError('Please pass the verify callback.');
    }

    function validateStringOption(optionName) {
        if (!isUndefined(options[optionName]) && (!isString(options[optionName]) || options[optionName].length === 0)) {
            throw new TypeError('Please pass a string to options.' + optionName);
        }
    }

    validateStringOption('authorizationURL');
    validateStringOption('tokenURL');
    validateStringOption('scopeSeparator');
    validateStringOption('sessionKey');
    validateStringOption('profileURL');
    this.fields = ["id", "username", "threads_profile_picture_url", "threads_biography"];
    if(options.fields && options.fields.length){
      this.fields = this.fields.concat(options.fields);
    }
    this.version = options.version || "v1.0";
    
    options.authorizationURL = options.authorizationURL || urls.authorizationURL;
    options.tokenURL = options.tokenURL || urls.tokenURL;
    options.scopeSeparator = options.scopeSeparator || ',';
    options.scope = options.scope || ['threads_basic'];
    options.sessionKey = options.sessionKey || 'oauth2:threads';

    OAuth2Strategy.call(this, options, verify);
    this.name = 'threads';
    this._oauth2.useAuthorizationHeaderforGET(true);
    this._profileURL = options.profileURL || urls.profileURL.replace("%version%", this.version);
    this.options = options;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Threads.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `threads`
 *   - `id`               the user's internal Threads ID
 *   - `displayName`      the user's full name
 *   - `url`              the user's profile page url
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */

Strategy.prototype.userProfile = function(accessToken, done) {
  var url = this._profileURL;
  var fields =
    "?fields=" + this.fields.join(",");
  
  this._oauth2.get( url + fields, accessToken, function (err, body, res) {
    if (err) {
      return done(
        new InternalOAuthError("failed to fetch user profile", err)
      );
    }
    var json = JSON.parse(body);
    try {
      var profile = {
        provider: 'threads',
        id: json.id,
        username: json.username,
        profileImage: json.threads_profile_picture_url,
        bioDescription: json.threads_biography
    };

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = Strategy;
