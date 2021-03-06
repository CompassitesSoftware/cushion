// jshint settings
/*global require: false, __dirname: false, it: false */

var expect = require('chai').expect,
    tests = [],
    config = require('./config.js'),
    cushion = {},
    originalRequest,
    urlCheck;


// create cushion test objects
cushion.connection = new (require('../cushion.js').Connection)(
  config.host,
  config.port,
  config.username,
  config.password
);
cushion.user = cushion.connection.user();
cushion.database = cushion.connection.database(config.database);
cushion.document = cushion.database.document(config.document);
cushion.design = cushion.database.document('_design/' + config.design);
cushion.design.list(config.list, [
  'function(head, request) {',
    'var row;',
    'start({"headers": {"Content-Type": "text/plain"}});',
    'while(row = getRow()) {send(row.value._id);}',
  '}'
].join(' '));
cushion.design.show(config.show, [
  'function(document, request) {',
    'return {',
      'body: "Hello " + JSON.stringify(request.query) + " " + request.id',
    '};',
  '}'
].join(' '));
cushion.design.view(config.view, 'function(doc) {emit(doc._id, doc);}');


// create mockup to test the correct request
originalRequest = cushion.connection.request.bind(cushion.connection);
cushion.connection.request = (function(properties) {
  if (urlCheck) {
    expect(urlCheck[0]).to.be.equal(properties.method);

    if (urlCheck[1] instanceof RegExp) {
      expect(properties.path).to.match(urlCheck[1]);
    } else {
      expect(urlCheck[1]).to.be.equal(properties.path);
    }

    if (urlCheck[2]) {
      expect(urlCheck[2]).to.be.deep.equal(properties.body);
    }

    if (urlCheck[3]) {
      expect(urlCheck[3]).to.be.deep.equal(properties.headers);
    }
  }

  originalRequest(properties);
}).bind(cushion.connection);


// get tests
require('fs').readdirSync(__dirname).filter(function(element) {
  return (element.match(/^\d{1}-[a-z]{1,}-test\.js$/) !== null);
}).sort().forEach(function(fileName) {
  tests = tests.concat(require(__dirname + '/' + fileName).tests);
});


tests.forEach(function(test) {
  var callpath = test.callpath.split('.');

  if (test.callback) {
    it(test.message, function(done) {
      cushion[callpath[0]][callpath[1]].apply(
        cushion[callpath[0]],
        (test['arguments'] || []).concat([function() {
          expect(arguments[0]).to.be.null; // error have to be null
          test.callback.apply(null, arguments);// test callback
          done(); // next test
        }])
      );
    });
  } else if (test['return']) {
    it(test.message, function(done) {
      // test callback
      test['return'](cushion[callpath[0]][callpath[1]].apply(
        cushion[callpath[0]],
        test['arguments'] || []
      ));

      done(); // next test
    });
  }
});
