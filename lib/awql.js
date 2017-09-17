'use strict';

var request = require('superagent');
var csv = require('csv-parse/lib/sync');

module.exports = AWQL;

/**
 * @constructor
 */
function AWQL(adwords, body) {
  if (!(this instanceof AWQL)) {
    return new AWQL(adwords, body);
  }
  this.adwords = adwords;
  this.awqlData = {};
  this.rawAwql = body;
  this.rawBody = null;
  this.headers = {};
}

/**
 * Select columns
 */
AWQL.prototype.select = function select(columns) {
  this.awqlData.columns = Array.isArray(columns) && columns ||
    columns.split(',');
  return this;
};

/**
 * Set from report
 */
AWQL.prototype.from = function from(report) {
  this.awqlData.from = report;
  return this;
};

/**
 * Set where clause(s)
 */
AWQL.prototype.where = function where(statement) {
  this.awqlData.where = statement;
  return this;
};

/**
 * Set start and end date for report
 */
AWQL.prototype.during = function during(start, end) {
  var args = Array.prototype.slice.call(arguments, 0);
  args = Array.isArray(args[0]) && args[0] || args;
  this.awqlData.during = args;
  return this;
};

/**
 * Set "and" clause
 */
AWQL.prototype.and = function and(statement) {
  this.awqlData.and = this.awqlData.and || [];
  if (Array.isArray(statement)) {
    this.awqlData.and = this.awqlData.and.concat(statement);
  } else {
    this.awqlData.and.push(statement);
  }
  return this;
};

/**
 * Run query and return results promise
 */
AWQL.prototype.run = function run() {
  var self = this;
  if (this.adwords.accessToken) {
    return this.request();
  }
  return this.adwords.auth()
    .then(function() {
      return self.request();
    });
};

/**
 * Create request and return
 */
AWQL.prototype.request = function getRequest() {
  var self = this;
  var query = this.rawAwql = this.rawAwql || this.buildAwql();
  var headers = this.headers = this.getHeaders();
  var url = this.url = this.adwords.host + '/api/adwords/reportdownload/' +
    this.adwords.version;
  var req = request.post(url)
    .type('form')
    .set(this.headers /* TODO */)
    .send({
      __rdquery: query,
      __fmt: 'CSV'
    });
  if (this.adwords.agent) {
    req.agent(agent);
  }
  return req.then(function (results) {
    self.rawBody = results.text;
    return self.parse(results.text);
  });
};

/**
 * Parse result set to json
 */
AWQL.prototype.parse = function parse(body) {
  var res = {};
  var lines = body.split('\n');
  lines.pop();
  var title = lines[0].split('"').join('');
  var date = title.split('(')[1].split(')')[0];
  res.report = title.split(' ')[0];
  res.timeframe = date;
  lines.shift();
  res.total = lines[lines.length - 1].split(',')[1];
  lines.pop();
  var columnNames = lines[0].split(',');
  columnNames = columnNames.map(function(name) {
    return name.toLowerCase();
  });
  res.fieldLength = columnNames.length;
  lines.shift();
  res.data = csv(lines.join('\n'), {
    columns: columnNames
  });
  return res;
};

/**
 * Get headers for request
 */
AWQL.prototype.getHeaders = function getHeaders() {
  return {
    Authorization: 'Bearer ' + this.adwords.accessToken,
    developerToken: this.adwords.developerToken,
    clientCustomerId: this.adwords.clientCustomerId
  };
};

/**
 * Build and return our AWQL query
 */
AWQL.prototype.buildAwql = function buildAwql() {
  var built = 'SELECT ';
  built += this.awqlData.columns.join(',');
  built += ' FROM ';
  built += this.awqlData.from;
  if (this.awqlData.where) {
    built += ' WHERE ' + this.awqlData.where;
  }
  if (this.awqlData.and) {
    built += ' AND ' + this.awqlData.and.join(' AND ');
  }
  if (this.awqlData.during) {
    built += ' DURING ' + this.awqlData.during.join(',');
  }
  return built;
};
