'use strict';

var should = require('should');
var adwords = require('..');
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
        'ConversionsManyPerClick',
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
});


