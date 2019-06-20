'use strict';

const chai = require('chai');
const nock = require('nock');
const Agent = require('https').Agent;
const Adwords = require('..');
const Awql = require('../lib/awql');
const opts = require('./test-auth.json');
const should = chai.should();
const goodRes = `Search Lost IS (budget),Total cost,Campaign ID,Campaign,Day
--,3310000,838383833,"General Terms (Q1, \'16)",2016-02-22
--,13900000,838383834,"Mens Collection (Q1, \'16)",2016-02-22
--,3020000,838383835,Brand Terms,2016-02-22`;
const badRes = `Search Lost IS (budget),Total cost,Campaign ID,Campaign,Day
--,3310000,838383833,"General "Terms (Q1, \'16)",2016-02-22
--,13900000,838383834,"Mens Collection (Q1, \'16)",2016-02-22

--,3020000,838383835,Brand Terms,2016-02-22,
`;

opts.agent = new Agent({ keepAlive: true });

/*global describe*/
/*global it*/

describe('AWQL tests', () => {
  it('should send a request and get a response', async () => {
    nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(200, {
        access_token: 'x',
      });
    nock('https://adwords.google.com')
      .post('/api/adwords/reportdownload/v201809')
      .reply(200, goodRes);
    const res = await new Adwords(opts)
      .awql()
      .select([
        'Impressions',
        'Clicks',
        'Cost',
        'Conversions',
        'ConversionValue',
        'CampaignName',
        'AdGroupName',
        'Device',
        'DayOfWeek',
        'CountryCriteriaId',
        'MetroCriteriaId',
        'Date',
        'AdNetworkType2'
      ])
      .from('GEO_PERFORMANCE_REPORT')
      .during('20150502', '20150602')
      .run();
    should.exist(res);
    const rows = [];
    for await (const row of res) {
      rows.push(row);
    }
    rows.should.have.length(3);
    rows[0].should.have.property('Search Lost IS (budget)', '--');
    rows[0].should.have.property('Total cost', '3310000');
    rows[0].should.have.property('Campaign ID', '838383833');
    rows[0].should.have.property('Campaign', 'General Terms (Q1, \'16)');
    rows[0].should.have.property('Day', '2016-02-22');
  });

  it('should fail with bad request', async () => {
    nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(200, {
        access_token: 'x'
      });
    nock('https://adwords.google.com')
      .post('/api/adwords/reportdownload/v201809')
      .reply(200, badRes);
    try {
      const res = await new Adwords(opts)
        .awql()
        .select([
          'Impressions',
          'Clicks',
          'Cost',
          'Conversions',
          'ConversionValue',
          'CampaignName',
          'AdGroupName',
          'Device',
          'DayOfWeek',
          'CountryCriteriaId',
          'MetroCriteriaId',
          'Date',
          'AdNetworkType2'
        ])
        .from('GEO_PERFORMANCE_REPORT')
        .during('20150502', '20150602')
        .run();
      const rows = [];
      for await (const row of res) {
        rows.push(row);
      }
    } catch (e) {
      return;
    }
    throw new Error('Should have failed');
  });

  it('should fail on receiving HTML during a token pull', async () => {
    nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(200, '<html></html>');
    try {
      await new Adwords(opts).auth();
    } catch (e) {
      return;
    }
    throw new Error('Should have failed');
  });
});


