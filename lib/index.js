'use strict';

const request = require('superagent');
const Promise = require('bluebird');
const Awql = require('./awql');

/**
 * @constructor
 */
class AdWords {
  constructor(opts = {}) {
    this.host = opts.host || 'https://adwords.google.com';
    this.headers = {};
    this.version = opts.version || 'v201809';
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
  awql() {
    const args = Array.prototype.slice.call(arguments, 0);
    args.unshift(this);
    return new Awql(...args);
  }

  /**
   * Perform our adwords authentication and return a promise
   */
  auth() {
    return new Promise((resolve, reject) => {
      return request.post('https://accounts.google.com/o/oauth2/token')
        .type('form')
        .timeout(this.timeout)
        .send({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token'
        })
        .then(res => {
          if (!res.body.access_token) {
            return reject(new Error('No access token available'));
          }
          if (res.body.error) {
            const e = new Error(res.body.error);
            e.status = 400;
            return reject(e);
          }
          this.accessToken = res.body.access_token;
          this.tokenExpires = res.body.expires;
          return resolve();
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
}

module.exports = AdWords;
