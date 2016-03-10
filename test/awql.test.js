'use strict';

var should = require('should');
var adwords = require('..');
var Awql = require('../lib/awql');
var opts = require('./test-auth.json');

/*global describe*/
/*global it*/

describe('AWQL tests', function() {
  it('should send a request and get a response', function(done) {
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
    var parser = new Awql({}, null);
    var data = [
      '"CAMPAIGN_PERFORMANCE_REPORT (Feb 22, 2016)"',
      'Search Lost IS (budget),Total cost,Campaign ID,Campaign,Day',
      '--,3310000,838383833,"General Terms (Q1, \'16)",2016-02-22',
      '--,13900000,838383834,"Mens Collection (Q1, \'16)",2016-02-22',
      '--,3020000,838383835,Brand Terms,2016-02-22',
      'Total,20230000, --, --, --',
      ''
    ].join('\n');
    var res = parser.parse(data);
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
});


