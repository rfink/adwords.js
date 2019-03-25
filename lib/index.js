'use strict';

var request = require('superagent');
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
  this.version = opts.version || 'v201708';
  this.accessToken = opts.accessToken;
  this.refreshToken = opts.refreshToken;
  this.developerToken = opts.developerToken;
  this.clientCustomerId = opts.clientCustomerId;
  this.clientId = opts.clientId;
  this.clientSecret = opts.clientSecret;
  this.timeout = opts.timeout || 60000;
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
    return request.post('https://accounts.google.com/o/oauth2/token')
      .type('form')
      .timeout(self.timeout)
      .send({
        client_id: self.clientId,
        client_secret: self.clientSecret,
        refresh_token: self.refreshToken,
        grant_type: 'refresh_token'
      })
      .then(function(res) {
        if (!res.body.access_token) {
          return reject(new Error('No access token available'));
        }
        if (res.body.error) {
          const e = new Error(res.body.error);
          e.status = 400;
          return reject(e);
        }
        self.accessToken = res.body.access_token;
        self.tokenExpires = res.body.expires;
        return resolve();
      })
      .catch(function(err) {
        return reject(err);
      });
  });
};
