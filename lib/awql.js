'use strict';

const request = require('superagent');
const parse = require('csv-parse');

/**
 * @constructor
 */
class AWQL {
  constructor(adwords, body) {
    this.adwords = adwords;
    this.awqlData = {};
    this.rawAwql = body;
    this.rawBody = null;
    this.headers = {};
  }

  /**
   * Select columns
   */
  select(columns) {
    this.awqlData.columns = Array.isArray(columns) && columns ||
      columns.split(',');
    return this;
  }

  /**
   * Set from report
   */
  from(report) {
    this.awqlData.from = report;
    return this;
  }

  /**
   * Set where clause(s)
   */
  where(statement) {
    this.awqlData.where = statement;
    return this;
  }

  /**
   * Set start and end date for report
   */
  during(start, end) {
    const args = Array.prototype.slice.call(arguments, 0);
    if (Array.isArray(args[0])) {
      this.awqlData.during = args[0];
    } else {
      this.awqlData.during = args;
    }
    return this;
  }

  /**
   * Set "and" clause
   */
  and(statement) {
    this.awqlData.and = this.awqlData.and || [];
    if (Array.isArray(statement)) {
      this.awqlData.and = this.awqlData.and.concat(statement);
    } else {
      this.awqlData.and.push(statement);
    }
    return this;
  }

  /**
   * Run query and return results promise
   */
  run() {
    if (this.adwords.accessToken && this.adwords.tokenExpires > Date.now()) {
      return this.request();
    }
    return this.adwords.auth()
      .then(() => {
        return this.request();
      });
  }

  /**
   * Create request and return
   */
  request() {
    const query = this.rawAwql = this.rawAwql || this.buildAwql();
    const headers = this.headers = this.getHeaders();
    const url = this.url = `${this.adwords.host}/api/adwords/reportdownload/${this.adwords.version}`;
    const req = request.post(url)
      .type('form')
      .set(this.headers /* TODO */)
      .timeout(this.adwords.timeout)
      .send({
        __rdquery: query,
        __fmt: 'CSV',
      });
    if (this.adwords.agent) {
      req.agent(agent);
    }
    const stream = parse({
      columns: true,
    });
    req.pipe(stream);
    return stream;
  }

  /**
   * Get headers for request
   */
  getHeaders() {
    return {
      Authorization: `Bearer ${this.adwords.accessToken}`,
      developerToken: this.adwords.developerToken,
      clientCustomerId: this.adwords.clientCustomerId,
      skipReportHeader: 'true',
      skipReportSummary: 'true',
    };
  }

  /**
   * Build and return our AWQL query
   */
  buildAwql() {
    let built = 'SELECT ';
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
  }
}

module.exports = AWQL;
