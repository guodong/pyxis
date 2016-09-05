'use strict';
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

module.exports = new JSONAPISerializer('deployments', {
  attributes: ['created_at', 'version', 'host:host'],
  version: {
    attributes: ['name', 'comment', 'created_at', 'image', 'cloudware'],
    ref: 'id',
    included: false,
    cloudware: {
      ref: 'id',
      attributes: ['name', 'logo']
    }
  },
  host: {
    attributes: ['name'],
    ref: 'id'
  }
});