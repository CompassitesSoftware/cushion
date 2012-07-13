// jshint settings
/*global exports: false, require: false*/

/**
 * Connection tests
 *
 *  1) get version
 *  2) list of active tasks
 *  3) get complete config
 *  4) get config section
 *  5) get config option
 *  6) set config option to new value
 *  7) delete config option
 *  8) create admin
 *  9) delete admin
 * 10) generate uuid
 * 11) generate three uuids
 * 12) get statistics
 * 13) get log
 * 14) get log with specific length of 500
 * 15) get list of databases
 * 16) get list of databases without couchdb related
 */

var expect = require('chai').expect,
    config = require('./config.js');

exports.tests = [{
  'message': 'get version',
  'callpath': 'connection.version',
  'callback': function(error, version) {
    expect(version).to.be.a('string').and.to.match(/^\d\.\d\.\d$/);
  }
}, {
  'message': 'list of active tasks',
  'callpath': 'connection.activeTasks',
  'callback': function(error, activeTasks) {
    expect(activeTasks).to.be.an('array');
  }
}, {
  'message': 'get complete config',
  'callpath': 'connection.config',
  'callback': function(error, config) {
    expect(config).to.be.an('object');
    expect(config.admins).to.be.an('object');
  }
}, {
  'message': 'get config section',
  'callpath': 'connection.config',
  'arguments': ['admins'],
  'callback': function(error, section) {
    expect(section).to.be.an('object').and.to.have.property(config.username);
  }
}, {
  'message': 'get config option',
  'callpath': 'connection.config',
  'arguments': ['admins', config.username],
  'callback': function(error, option) {
    expect(option).to.be.a('string').and.to.have.string('-hashed-');
  }
}, {
  'message': 'set config option to new value',
  'callpath': 'connection.config',
  'arguments': ['foo', 'bar', 'foobar'],
  'callback': function(error, saved) {
    expect(saved).to.be.a('boolean').and.to.be.true;
  }
}, {
  'message': 'delete config option',
  'callpath': 'connection.config',
  'arguments': ['foo', 'bar', null],
  'callback': function(error, deleted) {
    expect(deleted).to.be.a('boolean').and.to.be.true;
  }
}, {
  'message': 'create admin',
  'callpath': 'connection.createAdmin',
  'arguments': ['cushion_test_admin', 'cushion_test_password'],
  'callback': function(error, created) {
    expect(created).to.be.true;
  }
}, {
  'message': 'delete admin',
  'callpath': 'connection.deleteAdmin',
  'arguments': ['cushion_test_admin'],
  'callback': function(error, deleted) {
    expect(deleted).to.be.true;
  }
}, {
  'message': 'generate uuid',
  'callpath': 'connection.uuidList',
  'callback': function(error, uuid) {
    expect(uuid).to.be.an('array').and.to.have.length(1);
    expect(uuid[0]).to.be.a('string');
  }
}, {
  'message': 'generate three uuids',
  'callpath': 'connection.uuidList',
  'arguments': [3],
  'callback': function(error, uuids) {
    expect(uuids).to.be.an('array').and.to.have.length(3);
    expect(uuids[0]).to.be.a('string');
  }
}, {
  'message': 'get statistics',
  'callpath': 'connection.stats',
  'callback': function(error, stats) {
    expect(stats).to.be.an('object');
  }
}, {
  'message': 'get log',
  'callpath': 'connection.log',
  'callback': function(error, log) {
    expect(log).to.be.a('string');
    expect(log.length).to.be.below(1001);
  }
}, {
  'message': 'get log with specific length of 500',
  'callpath': 'connection.log',
  'arguments': [500],
  'callback': function(error, log) {
    expect(log).to.be.a('string');
    expect(log.length).to.be.below(501);
  }
}, {
  'message': 'get list of databases',
  'callpath': 'connection.listDatabases',
  'callback': function(error, databases) {
    expect(databases).to.be.an('array');
    expect(databases[0]).to.respondTo('name');
    expect(databases[0].name()).to.have.string('_');
  }
}, {
  'message': 'get list of databases without couchdb related',
  'callpath': 'connection.listDatabases',
  'arguments': [true],
  'callback': function(error, databases) {
    expect(databases).to.be.an('array');
    expect(databases[0]).to.respondTo('name');

    databases.forEach(function(database, index, databases) {
      expect(database.name()).to.not.match(/^_/);
    });
  }
}];