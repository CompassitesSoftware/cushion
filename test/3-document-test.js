// jshint settings
/*global exports: false, require: false*/

/**
 * 1) save document
 * 2) load document
 * 3) copy document
 * 4) info about the document
 * 5) save attachment
 * 6) save attachment with custom name
 * 7) load attachment
 * 8) delete attachment
 * 9) delete attachment with custom name
 * 10) delete document
 */

var fs = require('fs'),
    expect = require('chai').expect,
    config = require('./config.js'),
    docUrl = new RegExp(
      '^' + config.database + '\\/' +
      config.document +
      '\\?rev=[0-9]{1,}-[0-9a-z]{1,}$'
    ),
    attachmentUrl = new RegExp(
      '^' + config.database +
      '\\/' + config.document +
      '\\/(Makefile|' + config.attachment + ')' +
      '\\?rev=[0-9]{1,}-[0-9a-z]{1,}$'
    ),
    attachment = fs.readFileSync(__dirname + '/../Makefile', 'utf8');

exports.tests = [{
  'message': 'save document',
  'callpath': 'document.save',
  'url': ['PUT', config.database + '/' + config.document, {}],
  'callback': function(error, document) {
    expect(document).to.be.an('object').and.to.have.property('_id');
  },
}, {
  'message': 'load document',
  'callpath': 'document.load',
  'url': ['GET', docUrl],
  'callback': function(error, document) {
    expect(document).to.be.an('object').and.to.have.property('_id');
    expect(document.id()).to.equal(config.document);
  }
}, {
  'message': 'copy document',
  'callpath': 'document.copy',
  'arguments': [config.document + '_copy'],
  'url': [
    'COPY',
    docUrl,
    undefined,
    {'Destination': config.document + '_copy'}
  ],
  'callback': function(error, source, target) {
    expect(source).to.be.an('object').and.to.have.property('_id');
    expect(source.id()).to.be.equal(config.document);
    expect(target).to.be.an('object').and.to.have.property('_id');
    expect(target.id()).to.be.equal(config.document + '_copy');
  }
}, {
  'message': 'info about the document',
  'callpath': 'document.info',
  'url': ['HEAD', config.database + '/' + config.document],
  'callback': function(error, info) {
    expect(info).to.be.an('object')
    expect(info).to.have.property('revision')
    expect(info).to.have.property('size');
  }
}, {
  'message': 'save attachment',
  'callpath': 'document.saveAttachment',
  'arguments': [__dirname + '/../Makefile', 'text/plain'],
  'url': [
    'PUT',
    attachmentUrl,
    attachment,
    {
      'Content-Length': attachment.length,
      'Content-Type': 'text/plain'
    }
  ],
  'callback': function(error, confirmed) {
    expect(confirmed).to.be.true;
  }
}, {
  'message': 'save attachment with custom name',
  'callpath': 'document.saveAttachment',
  'arguments': [__dirname + '/../Makefile', 'text/plain', config.attachment],
  'url': [
    'PUT',
    attachmentUrl,
    attachment,
    {
      'Content-Length': attachment.length,
      'Content-Type': 'text/plain'
    }
  ],
  'callback': function(error, confirmed) {
    expect(confirmed).to.be.true;
  }
}, {
  'message': 'load attachment',
  'callpath': 'document.getAttachment',
  'arguments': [config.attachment],
  'url': [
    'GET',
    attachmentUrl
  ],
  'callback': function(error, attachment) {
    expect(attachment).to.be.a('string');
  }
}, {
  'message': 'delete attachment',
  'callpath': 'document.deleteAttachment',
  'arguments': ['Makefile'],
  'url': ['DELETE', attachmentUrl],
  'callback': function(error, deleted) {
    expect(deleted).to.be.true;
  }
}, {
  'message': 'delete attachment with custom name',
  'callpath': 'document.deleteAttachment',
  'arguments': [config.attachment],
  'url': ['DELETE', attachmentUrl],
  'callback': function(error, deleted) {
    expect(deleted).to.be.true;
  }
}, {
  'message': 'delete document',
  'callpath': 'document.destroy',
  'url': ['DELETE', docUrl],
  'callback': function(error, document) {
    expect(document).to.be.an('object').and.to.have.property('_id');
  }
}];
