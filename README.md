adwords.js
==========

Node AdWords client, currently only supports AWQL.  Influenced heavily
by [https://github.com/therebelrobot/google-adwords/blob/master/README.md],
with some updates to the internals for a tighter control on scoping, as well
as allowing the version to be set dynamically (not guaranteed to work in future,
untested versions of AdWords).  The client supports promise-based async handling,
to be compatible with future async constructs (ES7 async/await, or ES6 generators
with co.js).

Usage
==========

Installation:

```
  npm install https://github.com/rfink/adwords.js
```

Include in your app:

```javascript
  var adwords = require('adwords.js');
```

API
==========

Options can be set via the constructor:

```javascript
  var opts = {};
  opts.clientId = 'ADWORDS_CLIENT_ID';
  opts.clientSecret = 'ADWORDS_CLIENT_SECRET';
  opts.developerToken = 'ADWORDS_DEVELOPER_TOKEN';
  opts.refreshToken = 'ADWORDS_REFRESH_TOKEN';
  opts.accessToken = 'ADWORDS_ACCESS_TOKEN';
  opts.clientCustomerId = 'ADWORDS_CLIENT_CUSTOMER_ID';
  var client = adwords(opts); // Implicit "new" applied internally
```

You can also leave out the access token, and the API will get it for you
using the refresh token when you run the AWQL.

AWQL
==========

Basics:

```javascript
  var promise = adwords(opts)
    .awql()
    .select(['Impressions', 'Clicks', 'Device'])
    .from('GEO_PERFORMANCE_REPORT')
    .during('20150101', '2015-0131')
    .run();
  promise.then(function(res) {
    expect(res).toBeArray();
  });
```

"Where" is also available:

```javascript
  adwords(opts)
    .awql()
    .select(['Impressions', 'Clicks', 'Device'])
    .from('GEO_PERFORMANCE_REPORT')
    .where('Clicks>100')
    .and('Clicks<200')
    .and('Impressions>500')
    .during('20150101', '2015-0131')
    .run()
    .then(function(res) {
      expect(res).toBeArray();
    });
```

You can also pass raw AWQL to the AWQL constructor:

```javascript
  adwords(opts)
    .awql('SELECT Impressions,Clicks,Device FROM GEO_PERFORMANCE_REPORT')
    .run()
    .then(function(res) {
      expect(res).toBeArray();
    });
```

Notes
==========

This library is NOT a full implementation of the AdWords SOAP client that is
available in other languages (often supported by Google).  I'm maintaining
a separate fork from the original library so that I can meet the standards of
my current gig.  I may, in the future, fully stub out this library, but it
will not likely be anytime soon (as of July 14, 2015).

License
==========

MIT, as always.
