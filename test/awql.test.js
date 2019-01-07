'use strict';

const chai = require('chai');
const nock = require('nock');
const Agent = require('https').Agent;
const adwords = require('..');
const Awql = require('../lib/awql');
const opts = require('./test-auth.json');
const should = chai.should();
const goodRes = `"CAMPAIGN_PERFORMANCE_REPORT (Feb 22, 2016)"
Search Lost IS (budget),Total cost,Campaign ID,Campaign,Day
--,3310000,838383833,"General Terms (Q1, \'16)",2016-02-22
--,13900000,838383834,"Mens Collection (Q1, \'16)",2016-02-22
--,3020000,838383835,Brand Terms,2016-02-22
Total,20230000, --, --, --
`;
const badRes = `"CAMPAIGN_PERFORMANCE_REPORT (Feb 22, 2016)"
Search Lost IS (budget),Total cost,Campaign ID,Campaign,Day
--,3310000,838383833,"General "Terms (Q1, \'16)",2016-02-22
--,13900000,838383834,"Mens Collection (Q1, \'16)",2016-02-22

--,3020000,838383835,Brand Terms,2016-02-22
Total,20230000, --, --, --
`;

opts.agent = new Agent({ keepAlive: true });

/*global describe*/
/*global it*/

describe('AWQL tests', function() {
  it('should send a request and get a response', function(done) {
    nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(200, {
        access_token: 'x'
      });
    nock('https://adwords.google.com')
      .post('/api/adwords/reportdownload/v201708')
      .reply(200, goodRes);
    return adwords(opts)
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
      .run()
      .then(function(res) {
        should.exist(res);
        res.should.have.property('report');
        res.should.have.property('fieldLength');
        res.should.have.property('timeframe');
        res.should.have.property('total');
        res.should.have.property('data');
        return done();
      })
      .catch(done);
  });

  it('should parse correctly with weird characters', function(done) {
    const parser = new Awql({}, null);
    const res = parser.parse(goodRes);
    should.exist(res);
    res.should.have.property('data');
    res.data.should.have.length(3);
    res.data[0].should.have.property('search lost is (budget)', '--');
    res.data[0].should.have.property('total cost', '3310000');
    res.data[0].should.have.property('campaign id', '838383833');
    res.data[0].should.have.property('campaign', 'General Terms (Q1, \'16)');
    res.data[0].should.have.property('day', '2016-02-22');
    res.data[1].should.have.property('search lost is (budget)', '--');
    res.data[1].should.have.property('total cost', '13900000');
    res.data[1].should.have.property('campaign id', '838383834');
    res.data[1].should.have.property('campaign', 'Mens Collection (Q1, \'16)');
    res.data[1].should.have.property('day', '2016-02-22');
    res.data[2].should.have.property('search lost is (budget)', '--');
    res.data[2].should.have.property('total cost', '3020000');
    res.data[2].should.have.property('campaign id', '838383835');
    res.data[2].should.have.property('campaign', 'Brand Terms');
    res.data[2].should.have.property('day', '2016-02-22');
    return done();
  });

  it('should fail with bad request', function(done) {
    nock('https://accounts.google.com')
      .post('/o/oauth2/token')
      .reply(200, {
        access_token: 'x'
      });
    nock('https://adwords.google.com')
      .post('/api/adwords/reportdownload/v201708')
      .reply(200, badRes);
    return adwords(opts)
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
      .run()
      .then(res => {
        return done(new Error('Should have failed'));
      })
      .catch(err => {
        return done();
      });
  });
});


