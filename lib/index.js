'use strict';

var auth = require('adwords-auth');
var Promise = require('bluebird');
var Awql = require('./awql');

module.exports = AdWords;

/**
 * @constructor
 */
function AdWords(opts) {
  if (!(this instanceof AdWords)) {
    return new AdWords(opts);
  }
  opts = opts || {};
  this.host = opts.host || 'https://adwords.google.com';
  this.headers = {};
  this.version = opts.version || 'v201509';
  this.accessToken = opts.accessToken;
  this.refreshToken = opts.refreshToken;
  this.developerToken = opts.developerToken;
  this.clientCustomerId = opts.clientCustomerId;
  this.clientId = opts.clientId;
  this.clientSecret = opts.clientSecret;
}

/**
 * Get AWQL object instance
 */
AdWords.prototype.awql = function awql() {
  var args = Array.prototype.slice.call(arguments, 0);
  args.unshift(this);
  return Awql.apply(null, args);
};

/**
 * Perform our adwords authentication and return a promise
 */
AdWords.prototype.auth = function getAuth() {
  var self = this;
  return new Promise(function(resolve, reject) {
    auth.refresh(self.clientId, self.clientSecret, self.refreshToken,
      function tokenResponse(err, token) {
        if (err || token.error) {
          return reject(err + token.error + token.error_description);
        }
        self.accessToken = token.access_token;
        self.tokenExpires = token.expires;
        return resolve();
      });
  });
};
